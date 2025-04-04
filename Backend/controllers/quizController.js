// backend/controllers/quizController.js
const Quiz = require('../models/Quiz');
const User = require('../models/User'); // Need User model to update points

// Helper to generate a unique quiz code (simple example)
const generateUniqueQuizCode = async () => {
    let code;
    let isUnique = false;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    while (!isUnique) {
        code = '';
        for (let i = 0; i < 6; i++) { // Generate a 6-character code
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const existingQuiz = await Quiz.findOne({ quizCode: code });
        if (!existingQuiz) {
            isUnique = true;
        }
    }
    return code;
};


// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private
const createQuiz = async (req, res) => {
    const { title, description, questions } = req.body;
    let { quizCode } = req.body; // User might provide a custom code

    try {
        // Validate incoming data structure (basic checks)
        if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: 'Missing required fields: title and questions array.' });
        }

        // Validate Quiz Code if provided
        if (quizCode) {
            quizCode = quizCode.toUpperCase().trim();
            if (!/^[A-Z0-9_.-]+$/i.test(quizCode)) {
                 return res.status(400).json({ message: "Custom quiz code can only contain letters, numbers, hyphens (-), underscores (_), and periods (.)." });
            }
            const existingCode = await Quiz.findOne({ quizCode });
            if (existingCode) {
                return res.status(409).json({ message: `Quiz code "${quizCode}" is already taken. Try a different one or leave it blank for auto-generation.` });
            }
        } else {
            // Generate a unique code if not provided
            quizCode = await generateUniqueQuizCode();
        }


        const quiz = new Quiz({
            quizCode,
            title,
            description,
            questions: questions.map(q => ({ // Map frontend names to backend schema names if needed
                 questionText: q.questionText,
                 image: q.image, // Assuming base64 or URL is passed
                 options: q.options,
                 correctOptionIndex: q.correctOptionIndex, // Frontend sends correctAnswerIndex, map it
                 points: q.points
            })),
            createdBy: req.user._id, // Attach the logged-in user's ID
        });

        const createdQuiz = await quiz.save();
        res.status(201).json(createdQuiz);

    } catch (error) {
        console.error("Quiz Creation Error:", error);
         // Handle Mongoose validation errors specifically
        if (error.name === 'ValidationError') {
            // Collect specific error messages from nested questions if possible
             let messages = [];
             if (error.errors) {
                messages = Object.values(error.errors).map(val => val.message);
             }
             // Fallback for nested validation errors within questions array
             if (messages.length === 0 && error._message) {
                 messages.push(error._message); // General validation error message
             }
             // Try to get more specific errors from questions
             if (error.errors && error.errors['questions']) {
                messages.push(`Question validation error: ${error.errors['questions'].message}`);
             }

            return res.status(400).json({
                message: 'Quiz validation failed. Check questions and details.',
                errors: messages.length > 0 ? messages : ['Invalid data submitted']
             });
        }
        res.status(500).json({ message: 'Server error creating quiz' });
    }
};

// @desc    Get all available quizzes (basic info)
// @route   GET /api/quizzes
// @access  Public (or Private if only logged-in users can see)
const getAllQuizzes = async (req, res) => {
    try {
        // Select fields to reduce payload size, populate creator info if needed
        const quizzes = await Quiz.find({})
            .select('title description quizCode createdAt createdBy questions') // Include questions to get count/points? Maybe not needed here.
            // .populate('createdBy', 'username name'); // Optionally populate user info

         // Add question count and total possible points to each quiz
        const quizzesWithStats = quizzes.map(quiz => {
            const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
            return {
                _id: quiz._id,
                title: quiz.title,
                description: quiz.description,
                quizCode: quiz.quizCode,
                questionCount: quiz.questions.length,
                totalPoints: totalPoints,
                createdAt: quiz.createdAt,
                // createdBy: quiz.createdBy // Uncomment if populated
            };
        });


        res.json(quizzesWithStats);
    } catch (error) {
        console.error("Get All Quizzes Error:", error);
        res.status(500).json({ message: 'Server error fetching quizzes' });
    }
};

// @desc    Get a single quiz by its code for playing
// @route   GET /api/quizzes/:quizCode
// @access  Public (or Private)
const getQuizByCode = async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ quizCode: req.params.quizCode.toUpperCase() })
             // Exclude correct answers when fetching for playing initially
             .select('-questions.correctOptionIndex');
             // .populate('createdBy', 'username'); // Optionally populate creator

        if (quiz) {
            res.json(quiz);
        } else {
            res.status(404).json({ message: 'Quiz not found' });
        }
    } catch (error) {
        console.error("Get Quiz By Code Error:", error);
        res.status(500).json({ message: 'Server error fetching quiz' });
    }
};

// @desc    Submit quiz answers and calculate score
// @route   POST /api/quizzes/:quizCode/submit
// @access  Private
const submitQuiz = async (req, res) => {
    const { answers } = req.body; // Expect an array of selected option indices e.g., [1, 0, 2, ...]

    if (!Array.isArray(answers)) {
        return res.status(400).json({ message: 'Invalid submission format. "answers" should be an array.' });
    }

    try {
        // Find the quiz, but this time INCLUDE the correct answers
        const quiz = await Quiz.findOne({ quizCode: req.params.quizCode.toUpperCase() });

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Ensure number of answers matches number of questions
        if (answers.length !== quiz.questions.length) {
            return res.status(400).json({ message: `Submission error: Expected ${quiz.questions.length} answers, received ${answers.length}.` });
        }

        let score = 0;
        let maxScore = 0;

        // Calculate score securely on the backend
        quiz.questions.forEach((question, index) => {
             maxScore += question.points; // Sum up total possible points
             const submittedAnswerIndex = answers[index];
            // Check if submitted answer index is valid (0-3) and matches the correct index
            if (submittedAnswerIndex !== null && submittedAnswerIndex !== undefined &&
                submittedAnswerIndex >= 0 && submittedAnswerIndex <= 3 && // Basic validation
                submittedAnswerIndex === question.correctOptionIndex) {
                 score += question.points; // Add points for correct answer
             }
        });

        // Update user's total points
        const user = await User.findById(req.user._id);
        if (user) {
            user.totalPoints += score;
            await user.save();
            res.json({
                message: 'Quiz submitted successfully!',
                score: score,
                maxScore: maxScore,
                updatedTotalPoints: user.totalPoints,
            });
        } else {
            // This shouldn't happen if protect middleware works, but handle defensively
             res.status(404).json({ message: 'User not found to update score.' });
        }

    } catch (error) {
        console.error("Submit Quiz Error:", error);
        res.status(500).json({ message: 'Server error submitting quiz' });
    }
};


module.exports = {
    createQuiz,
    getAllQuizzes,
    getQuizByCode,
    submitQuiz,
};