// src/Components/Play.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import hooks
import axiosInstance from '../api/axiosInstance'; // Import instance

const Play = () => {
    const { quizCode } = useParams(); // Get quizCode from URL
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null); // Store the whole quiz object
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState([]); // Store selected index for each question
    const [currentSelection, setCurrentSelection] = useState(null); // Currently selected option index for the *current* question
    const [score, setScore] = useState(0);
    const [maxScore, setMaxScore] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null); // Correct answer for the current question
    const [quizFinished, setQuizFinished] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [finalResult, setFinalResult] = useState(null); // Store result from submit API

    // Fetch Quiz Data
    useEffect(() => {
        const fetchQuiz = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axiosInstance.get(`/quizzes/${quizCode}`);
                setQuiz(response.data);
                setQuestions(response.data.questions);
                // Initialize selectedAnswers array with nulls
                setSelectedAnswers(new Array(response.data.questions.length).fill(null));
                setCurrentQuestionIndex(0); // Start from first question
                setQuizFinished(false);     // Reset finished state
                setFinalResult(null);       // Reset result
                setShowFeedback(false);     // Reset feedback
                setCurrentSelection(null);  // Reset current selection
            } catch (err) {
                console.error("Error fetching quiz:", err.response?.data || err.message);
                setError(err.response?.data?.message || "Failed to load quiz. Invalid code or server error.");
                 if (err.response?.status === 401) {
                     localStorage.removeItem('quizAppToken');
                     localStorage.removeItem('quizAppUser');
                     navigate('/login');
                 }
            } finally {
                setLoading(false);
            }
        };

        if (quizCode) {
            fetchQuiz();
        } else {
             setError("No quiz code provided.");
             setLoading(false);
        }

    }, [quizCode, navigate]); // Re-fetch if quizCode changes

    // Calculate progress
    const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

    // Handle Option Selection for the CURRENT question
    const handleOptionSelect = (index) => {
        if (showFeedback || quizFinished || isSubmitting) return;
        setCurrentSelection(index);

        // Store the selection for this question index
        const updatedAnswers = [...selectedAnswers];
        updatedAnswers[currentQuestionIndex] = index;
        setSelectedAnswers(updatedAnswers);

        // --- Optional: Show immediate feedback ---
        // To show immediate feedback, you'd need the correct answers here.
        // The current backend route GET /api/quizzes/:quizCode EXCLUDES correct answers.
        // You'd need to either:
        // 1. Modify backend to include correct answers (less secure if someone inspects network).
        // 2. Make a separate call *after* selection to check just this answer (adds complexity).
        // 3. Only show feedback after submitting the whole quiz (simplest, implemented below).
        // For now, we'll just record the answer and move on or submit.
    };

    // Handle moving to the next question or finishing
    const handleNextOrFinish = async () => {
        if (currentQuestionIndex < questions.length - 1) {
            // Move to next question
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setCurrentSelection(selectedAnswers[currentQuestionIndex + 1]); // Load previous selection if exists
            setShowFeedback(false); // Hide feedback if it was shown
        } else {
            // --- Finish Quiz and Submit ---
            setIsSubmitting(true);
            setError(null);
            try {
                 console.log("Submitting answers:", selectedAnswers);
                 const response = await axiosInstance.post(`/quizzes/${quizCode}/submit`, {
                    answers: selectedAnswers, // Send the array of selected indices
                });

                setFinalResult(response.data); // Store { message, score, maxScore, updatedTotalPoints }
                setScore(response.data.score); // Update score state
                setMaxScore(response.data.maxScore); // Update maxScore state
                setQuizFinished(true); // Mark quiz as finished

            } catch (err) {
                 console.error("Error submitting quiz:", err.response?.data || err.message);
                 setError(err.response?.data?.message || "Failed to submit quiz results.");
                 if (err.response?.status === 401) {
                     localStorage.removeItem('quizAppToken');
                     localStorage.removeItem('quizAppUser');
                     navigate('/login');
                 }
            } finally {
                 setIsSubmitting(false);
            }
        }
    };

    // Get the current question object safely
    const currentQuestion = questions ? questions[currentQuestionIndex] : null;


    // --- Render Logic ---
    if (loading) {
        return <div className="text-center p-10">Loading quiz...</div>;
    }
    if (error) {
        return <div className="text-center p-10 text-red-600">Error: {error} <Link to="/home" className="text-blue-500 underline">Go Home</Link></div>;
    }
    if (!quiz || !currentQuestion) {
        return <div className="text-center p-10">Quiz data not available.</div>;
    }

    // --- Quiz Finished View ---
    if (quizFinished && finalResult) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-100 to-teal-200 py-6 flex justify-center items-center px-4">
                <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Quiz Finished!</h2>
                    <p className="text-xl text-gray-700 mb-6">
                        Your score: <span className="font-semibold text-green-600">{finalResult.score}</span> out of {finalResult.maxScore}
                    </p>
                    {/* You could add a leaderboard snippet here if needed */}
                     <p className="text-md text-gray-600 mb-6">
                        Your total points are now: {finalResult.updatedTotalPoints}
                     </p>
                     {error && <p className="text-red-500 mb-4">{error}</p>} {/* Show submission error */}
                    <button
                        onClick={() => navigate('/home')} // Go back to dashboard
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-300 mr-2"
                    >
                        Back to Dashboard
                    </button>
                     {/* Optional: Replay button - would need state reset logic */}
                     {/* <button onClick={resetQuiz} ... >Play Again</button> */}
                </div>
            </div>
        );
    }


    // --- Active Quiz View ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 py-6 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden max-w-xl w-full">
                {/* Progress Bar */}
                <div className="bg-gray-200 h-3 ">
                    <div
                        className="bg-green-500 h-full rounded-r-full transition-all duration-500 ease-in-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <div className="p-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2 flex justify-between">
                        <span>Question {currentQuestionIndex + 1}/{questions.length}</span>
                        <span className="font-bold text-blue-600">{currentQuestion.points} Points</span>
                    </h2>

                    {currentQuestion.image && (
                        <img src={currentQuestion.image} alt="Question" className="mb-4 rounded-md max-h-60 w-full object-contain" />
                    )}
                    <p className="text-lg text-gray-700 mb-6">{currentQuestion.questionText}</p>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                className={`option-button block w-full p-4 rounded-md border-2 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400
                                    ${currentSelection === index ? 'bg-indigo-100 border-indigo-500 ring-2 ring-indigo-300 scale-105 shadow-md' : 'bg-white border-gray-300 hover:border-indigo-400 hover:bg-indigo-50'}
                                `}
                                onClick={() => handleOptionSelect(index)}
                                disabled={isSubmitting} // Disable while submitting final answers
                            >
                                <span className="font-semibold">{String.fromCharCode(65 + index)}.</span> {option}
                            </button>
                        ))}
                    </div>

                    {/* Error display during quiz */}
                    {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

                    {/* Next/Finish Button */}
                    <button
                        onClick={handleNextOrFinish}
                        className={`w-full font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-300 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-700 text-white'}`}
                        disabled={currentSelection === null || isSubmitting} // Disable if no option selected for current question OR during submission
                    >
                        {isSubmitting ? 'Submitting...' : (currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Play;