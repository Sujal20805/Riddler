// backend/routes/userRoutes.js
const express = require('express');
const { getUserProfile, updateUserProfile, getLeaderboard } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/leaderboard', getLeaderboard); // Public leaderboard

// Routes below require authentication
router.route('/profile')
    .get(protect, getUserProfile)       // GET profile
    .put(protect, updateUserProfile);   // PUT update profile

module.exports = router;