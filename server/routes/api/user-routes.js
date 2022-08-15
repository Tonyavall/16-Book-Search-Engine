const router = require('express').Router();
const {
  createUser,
  getSingleUser,
  saveBook,
  deleteBook,
  login,
} = require('../../controllers/user-controller');

// import middleware
const { authMiddleware } = require('../../utils/auth');

// put authMiddleware anywhere we need to send a token for verification of user
router.route('/')
  //create user
  .post(createUser)
  //save the book
  .put(authMiddleware, saveBook);

router.route('/login')
  // login
  .post(login);

router.route('/me')
  //query
  .get(authMiddleware, getSingleUser);

router.route('/books/:bookId')
  // delete a book
  .delete(authMiddleware, deleteBook);

module.exports = router;
