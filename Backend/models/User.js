// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        // Basic email format validation
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address'],
    },
    passwordHash: {
        type: String,
        required: [true, 'Password hash is required'],
        // Note: In a real app, never store plain passwords. Use bcrypt.
    },
    totalPoints: {
        type: Number,
        default: 0,
        min: 0,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt
    collection: 'users' // Explicitly set the collection name
});

// Optional: Index for faster username lookups
UserSchema.index({ username: 1 });
// Optional: Index for leaderboard sorting
UserSchema.index({ totalPoints: -1 });


module.exports = mongoose.model('User', UserSchema);