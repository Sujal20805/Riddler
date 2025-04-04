// backend/routes/quizRoutes.js
const express = require('express');
const { createQuiz, getAllQuizzes, getQuizByCode, submitQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .post(protect, createQuiz)    // Create a quiz (requires login)
    .get(getAllQuizzes);        // Get all quizzes (public or use protect if login needed)

router.route('/:quizCode')
    .get(getQuizByCode); // Get specific quiz for playing (public or use protect)

router.route('/:quizCode/submit')
    .post(protect, submitQuiz); // Submit quiz answers (requires login)

module.exports = router;