const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
              return User
                .findOne({ _id: context.user._id })
                .populate('savedBooks');
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },
    Mutation: {
        addUser: async (parent, {username, email, password}) => {
            const user = await User.create({username, email, password});
            if (!user) {
                return res.status(400).json({ message: 'Something is wrong!' });
            }
            const token = signToken(user);

            return { token, user }
        },
        login: async (parent, {username, password}) => {
            const user = await User.findOne({ username });

            if (!user) {
              throw new AuthenticationError('No user found with this email address');
            }

            const correctPw = await user.isCorrectPassword(password);
      
            if (!correctPw) {
              throw new AuthenticationError('Incorrect credentials');
            }
      
            const token = signToken(user);
      
            return { token, user };
        },
        saveBook: async (parent, savedBook, context) => {
            console.log(savedBook)
            try {
                if (!context.user) throw new AuthenticationError('You need to be logged in!');

                const { savedBooks } = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    // A set is an array of unique items, will never duplicate the same book
                    // Here we spread the payload properties which are the book properties
                    { $addToSet: { savedBooks: savedBook } },
                    { new: true, runValidators: true }
                );
                // We return the destructured savedBooks array for this user
                return savedBooks
            } catch (err) {
                console.log(err);
                return err;
            }
        },
        removeBook: async (parent, { bookId }, context) => {
            try {
                if (!context.user) throw new AuthenticationError('You need to be logged in!');

                // we probably don't need a default value for saved books here but it's
                // something to consider for future destructured properties just in case
                // they are undefined
                const { savedBooks = [] } = await User.findOneAndUpdate(
                  { _id: context.user.id },
                  { $pull: { savedBooks: { bookId: bookId } } },
                  { new: true }
                );
                // The only case here where savedBooks is undefined is if the user doesn't exist
                if (savedBooks === undefined) {
                  return { message: "Couldn't find user with this id!" }
                }
                return savedBooks
            } catch(err) { 
                console.log(err)
                return err
            }
        },
    }
}

module.exports = resolvers