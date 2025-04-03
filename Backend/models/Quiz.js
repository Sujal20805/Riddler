// backend/models/Quiz.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: [true, 'Question text is required'],
        trim: true,
    },
    image: {
        type: String, // Store Base64 encoded image string
        required: false, // Make the image optional
        default: null,
        // Note: Storing large Base64 strings can impact performance and document size.
        // Consider dedicated file storage (like S3/Cloudinary) for production apps
        // storing only the URL here if images are large or numerous.
    },
    options: {
        type: [String],
        required: true,
        validate: [
            (val) => val.length === 4 && val.every(opt => typeof opt === 'string' && opt.trim().length > 0),
            'Question must have exactly 4 non-empty options'
        ],
    },
    correctOptionIndex: {
        type: Number,
        required: [true, 'Correct option index is required'],
        min: 0,
        max: 3,
    },
    points: {
        type: Number,
        required: [true, 'Points are required'],
        min: [10, 'Points must be at least 10'],
        validate: [
             (val) => val % 10 === 0,
             'Points must be a multiple of 10'
        ]
    },
}, { _id: false }); // Don't create separate _id for subdocument questions

const QuizSchema = new mongoose.Schema({
    quizCode: {
        type: String,
        required: [true, 'Quiz code is required'],
        unique: true, // Ensure quiz codes are unique
        trim: true,
        uppercase: true,
    },
    title: {
        type: String,
        required: [true, 'Quiz title is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        default: '',
    },
    questions: {
        type: [QuestionSchema], // Array of nested questions
        validate: [
            (val) => Array.isArray(val) && val.length > 0,
            'Quiz must have at least one question'
        ]
    },
    createdBy: {
        type: String, // Or mongoose.Schema.Types.ObjectId if linking to a User model
        required: false, // Make optional or required based on auth setup
        default: 'anonymous', // Or remove default if always required
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    collection: 'quizzes' // Explicitly set the collection name
});

// Optional: Add index for faster lookups if needed later
QuizSchema.index({ quizCode: 1 });

module.exports = mongoose.model('Quiz', QuizSchema);