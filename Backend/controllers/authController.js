// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
require('dotenv').config();

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map(e => e.msg) });
    }

    const { username, name, email, password, dob } = req.body;

    try {
        // Check if user already exists (by username or email)
        const userExists = await User.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            let message = 'User already exists';
            if (userExists.email === email && userExists.username === username) {
                message = 'Username and Email already taken';
            } else if (userExists.email === email) {
                message = 'Email already taken';
            } else {
                message = 'Username already taken';
            }
            return res.status(400).json({ message });
        }

        // Create user
        const user = await User.create({
            username,
            name,
            email,
            password, // Hashing happens via pre-save hook in model
            dob,
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                token: generateToken(user._id), // Send token upon successful registration
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("Registration Error:", error);
        // Handle Mongoose validation errors specifically if needed
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
     const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map(e => e.msg) });
    }

    const { username, password } = req.body; // Assuming login via username

    try {
        // Find user by username (case-insensitive search)
        const user = await User.findOne({ username: username.toLowerCase() });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Logout user (client-side responsibility)
// @route   POST /api/auth/logout (Optional: Can be used for server-side blacklist if needed)
// @access  Private (requires token to identify user if blacklisting)
const logoutUser = (req, res) => {
    // Primarily, JWT logout is handled by the client deleting the token.
    // This endpoint is often informational or used for token blacklisting (more complex).
    res.status(200).json({ message: 'Logout successful (token should be cleared client-side)' });
};


module.exports = {
    registerUser,
    loginUser,
    logoutUser,
};