// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true,
    },
    name: { // Full Name
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'], // Basic email format validation
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
    },
    dob: { // Date of Birth
        type: Date,
        required: [true, 'Date of Birth is required'],
    },
    bio: {
        type: String,
        default: '',
        trim: true,
    },
    profilePicture: { // Store URL or path, handle upload separately if needed
        type: String,
        default: 'https://via.placeholder.com/150', // Default placeholder
    },
    totalPoints: {
        type: Number,
        default: 0,
    },
    // Optional: Keep track of quizzes created by the user
    // quizzesCreated: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Quiz'
    // }],
    // Optional: Keep track of quizzes played and scores
    // quizzesPlayed: [{
    //     quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    //     score: Number,
    //     datePlayed: { type: Date, default: Date.now }
    // }]
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

// Hash password before saving the user model
UserSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare entered password with hashed password in DB
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;