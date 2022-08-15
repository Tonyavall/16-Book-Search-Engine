const { AuthenticationError } = require('apollo-server-express');
const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        user: async (parent, {username}) => {
            return User.findOne({username}).populate('savedBooks')
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
            const user = await User.findOne({ email });

            if (!user) {
              throw new AuthenticationError('No user found with this email address');
            }
      
            const correctPw = await user.isCorrectPassword(password);
      
            if (!correctPw) {
              throw new AuthenticationError('Incorrect credentials');
            }
      
            const token = signToken(user);
      
            return { token, user };
        }
    }
}

module.exports = resolvers