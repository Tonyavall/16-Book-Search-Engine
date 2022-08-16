const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        user: async (parent, {username}) => {
            const foundUser = await User.findOne({
                $or: [{ _id: _id }, { username: username }],
            });
        
            if (!foundUser) {
                return { message: 'Cannot find a user with this id!' }
            }
          
            return foundUser
        },
        me: async (parent, args, context) => {
            if (context.user) {
              return User.findOne({ _id: context.user._id }).populate('thoughts');
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },
    Mutation: {
        createUser: async (parent, {username, email, password}) => {
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
        saveBook: async (parent, { bookData }, context) => {
            try {
                if (!context.user) return { message: 'You must be logged in!' }

                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: bookData } },
                    { new: true, runValidators: true }
                );
                return updatedUser
            } catch (err) {
                console.log(err);
                return err;
            }
        },
        async deleteBook({ user, params }, res) {
            const updatedUser = await User.findOneAndUpdate(
              { _id: user._id },
              { $pull: { savedBooks: { bookId: params.bookId } } },
              { new: true }
            );
            if (!updatedUser) {
              return res.status(404).json({ message: "Couldn't find user with this id!" });
            }
            return res.json(updatedUser);
        },
    }
}

module.exports = resolvers