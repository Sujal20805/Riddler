// backend/routes/authRoutes.js
const express = require('express');
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');
const { check } = require('express-validator');

const router = express.Router();

// Validation middleware for registration
const registerValidation = [
    check('username', 'Username is required').not().isEmpty().trim(),
    check('name', 'Name is required').not().isEmpty().trim(),
    check('email', 'Please include a valid email').isEmail().normalizeEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    check('dob', 'Date of Birth is required').not().isEmpty().isISO8601().toDate(), // Validate date format
];

// Validation middleware for login
const loginValidation = [
    check('username', 'Username is required').not().isEmpty(),
    check('password', 'Password is required').exists(),
];


router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.post('/logout', logoutUser); // Logout doesn't strictly need middleware unless blacklisting

module.exports = router;