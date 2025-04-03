// backend/controllers/userController.js
const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    // req.user is attached by the protect middleware
    const user = await User.findById(req.user._id).select('-password'); // Exclude password

    if (user) {
        res.json({
            _id: user._id,
            username: user.username,
            name: user.name,
            email: user.email,
            dob: user.dob,
            bio: user.bio,
            profilePicture: user.profilePicture,
            totalPoints: user.totalPoints,
            createdAt: user.createdAt,
            // Add quiz stats if you implement tracking later
            quizStats: { // Placeholder data structure matching frontend
                quizzesTaken: 0, // Replace with actual logic if tracked
                averageScore: 'N/A',
                highestScore: 'N/A',
                categoriesCompleted: []
            }
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        // Update allowed fields
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.username = req.body.username || user.username; // Allow username update (ensure uniqueness)
        user.bio = req.body.bio !== undefined ? req.body.bio : user.bio; // Handle empty string for bio

        // Handle profile picture update (assuming Base64 or URL is sent directly)
        if (req.body.profilePicture) {
            user.profilePicture = req.body.profilePicture;
        }

        // If password is being updated
        if (req.body.password) {
             if (req.body.password.length < 6) {
                 return res.status(400).json({ message: 'Password must be at least 6 characters long' });
             }
            user.password = req.body.password; // Hashing will happen via pre-save hook
        }

        try {
            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                username: updatedUser.username,
                name: updatedUser.name,
                email: updatedUser.email,
                bio: updatedUser.bio,
                profilePicture: updatedUser.profilePicture,
                totalPoints: updatedUser.totalPoints,
                token: req.headers.authorization.split(' ')[1], // Send back the same token or generate new if needed
                 quizStats: { // Placeholder data structure matching frontend
                    quizzesTaken: 0,
                    averageScore: 'N/A',
                    highestScore: 'N/A',
                    categoriesCompleted: []
                }
            });
        } catch (error) {
            console.error("Profile Update Error:", error);
            // Handle potential duplicate key errors if username/email is changed
            if (error.code === 11000) {
                 const field = Object.keys(error.keyValue)[0];
                 return res.status(400).json({ message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.` });
            }
            // Handle Mongoose validation errors
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(val => val.message);
                return res.status(400).json({ message: messages.join(', ') });
            }
            res.status(500).json({ message: 'Error updating profile' });
        }
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Get global leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
    try {
        // Get top N users sorted by totalPoints descending
        const limit = parseInt(req.query.limit) || 10; // Default to top 10
        const leaderboard = await User.find()
            .sort({ totalPoints: -1 }) // Sort descending
            .limit(limit)
            .select('username name totalPoints profilePicture'); // Select only needed fields

        res.json(leaderboard);
    } catch (error) {
        console.error("Leaderboard Fetch Error:", error);
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
};


module.exports = {
    getUserProfile,
    updateUserProfile,
    getLeaderboard,
};