const express = require('express');
const { body } = require('express-validator');
const { login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required'),
    validate,
  ],
  login
);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
