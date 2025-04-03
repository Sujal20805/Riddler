// backend/routes/quizRoutes.js
const express = require('express');
const Quiz = require('../models/Quiz'); // Import the updated model

const router = express.Router();
// backend/routes/quizRoutes.js
// ... other imports and code ...

// @route   POST /api/quizzes
// @desc    Create a new quiz
// @access  Public (adjust if auth is added)
router.post('/', async (req, res) => {
    try {
        // ... (rest of the validation and data prep) ...

        const newQuiz = new Quiz(quizData);
        const savedQuiz = await newQuiz.save();

        // --- ADD THIS LOG ---
        console.log(`[SUCCESS] Quiz "${savedQuiz.title}" (ID: ${savedQuiz._id}, Code: ${savedQuiz.quizCode}) saved to database.`);
        // --- END OF ADDED LOG ---

        res.status(201).json(savedQuiz); // Return the created quiz object

    } catch (error) {
        // Keep existing error handling
        console.error("Error saving quiz:", error);
         if (error.name === 'ValidationError') {
             // ...
         }
         if (error.code === 11000 && error.keyPattern && error.keyPattern.quizCode) {
             // ...
         }
        res.status(500).json({ message: 'Server error while creating quiz.', error: error.message });
    }
});

// @route   GET /api/quizzes
// @desc    Get all quizzes (basic info for dashboard)
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Select fields needed for the dashboard display
        const quizzes = await Quiz.find({})
                                  .select('_id quizCode title description') // Fetch only necessary fields
                                  .sort({ createdAt: -1 }); // Optional: sort by newest first

        res.status(200).json(quizzes);
    } catch (error) {
        console.error("Error fetching quizzes:", error);
        res.status(500).json({ message: 'Server error while fetching quizzes.', error: error.message });
    }
});


// Add other routes later (GET by code, PUT, DELETE) if needed
// router.get('/:quizCode', ...) // Example: Fetch full details for one quiz

module.exports = router;