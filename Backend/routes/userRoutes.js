// backend/routes/userRoutes.js
const express = require('express');
const User = require('../models/User'); // Import the User model

const router = express.Router();

// @route   GET /api/users/leaderboard
// @desc    Get top users for the leaderboard
// @access  Public (adjust if auth is needed)
router.get('/leaderboard', async (req, res) => {
    try {
        // Fetch top 5 users sorted by totalPoints descending
        // Select only username and totalPoints
        const topUsers = await User.find({})
            .sort({ totalPoints: -1 }) // -1 for descending order
            .limit(5) // Get top 5 users
            .select('username totalPoints'); // Only return these fields

        if (!topUsers) {
            // Should ideally not happen with find(), but good practice
            return res.status(404).json({ message: 'Could not retrieve leaderboard data.' });
        }

        res.status(200).json(topUsers);

    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ message: 'Server error while fetching leaderboard.', error: error.message });
    }
});

// Add other user routes later (e.g., registration, login, profile) if needed

module.exports = router;