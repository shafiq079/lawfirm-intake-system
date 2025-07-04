
const express = require('express');
const {
  registerUser,
  authUser,
  logoutUser,
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(registerUser);
router.post('/login', authUser);
router.post('/logout', protect, logoutUser);

module.exports = router;
