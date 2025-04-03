// backend/models/Quiz.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: [true, 'Question text cannot be empty.'],
        trim: true,
    },
    image: { // Store Base64 string or URL
        type: String,
        default: null,
    },
    options: {
        type: [String],
        required: true,
        validate: [
            (val) => Array.isArray(val) && val.length === 4 && val.every(opt => typeof opt === 'string' && opt.trim().length > 0),
            'Must provide exactly 4 non-empty options.'
        ]
    },
    correctOptionIndex: { // Renamed from correctAnswerIndex for consistency
        type: Number,
        required: [true, 'Correct answer index is required.'],
        min: 0,
        max: 3,
    },
    points: {
        type: Number,
        required: [true, 'Points are required.'],
        min: [10, 'Points must be at least 10.'],
        validate: [
            (val) => Number.isInteger(val) && val > 0 && val % 10 === 0,
            'Points must be a positive multiple of 10.'
        ]
    }
}, { _id: false }); // Don't create separate _id for subdocuments unless needed

const QuizSchema = new mongoose.Schema({
    quizCode: { // Unique code to identify and play the quiz
        type: String,
        required: [true, 'Quiz code is required.'],
        unique: true,
        trim: true,
        uppercase: true, // Store code in uppercase
    },
    title: {
        type: String,
        required: [true, 'Quiz title is required.'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        default: '',
    },
    questions: {
        type: [QuestionSchema],
        required: true,
        validate: [
            (val) => Array.isArray(val) && val.length > 0,
            'Quiz must have at least one question.'
        ]
    },
    createdBy: { // Link to the user who created the quiz
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Reference to the User model
    },
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', QuizSchema);

module.exports = Quiz;