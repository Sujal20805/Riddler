import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // Added Link
import axiosInstance from '../api/axiosInstance';

const Play = () => {
    const { quizCode } = useParams(); // Get quizCode from URL parameter
    const navigate = useNavigate();

    // State variables
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [currentSelection, setCurrentSelection] = useState(null); // User's choice for the current question
    const [quizFinished, setQuizFinished] = useState(false);
    const [finalResult, setFinalResult] = useState(null); // Stores { score, maxScore, updatedTotalPoints }
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Quiz Data Effect
    useEffect(() => {
        const handleAuthError = (err) => {
             if (err.response?.status === 401) {
                 console.error("Authentication error. Logging out.");
                 localStorage.removeItem('quizAppToken');
                 localStorage.removeItem('quizAppUser');
                 navigate('/login');
                 return true;
             }
             return false;
        };

        const fetchQuiz = async () => {
            setLoading(true);
            setError(null);
            setQuizFinished(false); // Reset state for new quiz load
            setFinalResult(null);
            setCurrentQuestionIndex(0);
            setCurrentSelection(null);

            try {
                // Fetch quiz data (backend excludes correct answers here)
                const response = await axiosInstance.get(`/quizzes/${quizCode}`);
                if (!response.data || !response.data.questions || response.data.questions.length === 0) {
                    throw new Error("Invalid quiz data received.");
                }
                setQuiz(response.data);
                setQuestions(response.data.questions);
                // Initialize selectedAnswers array with null for each question
                setSelectedAnswers(new Array(response.data.questions.length).fill(null));
            } catch (err) {
                console.error("Error fetching quiz:", err.response?.data || err.message);
                if (!handleAuthError(err)) {
                    setError(err.response?.data?.message || "Failed to load quiz. Invalid code or server error.");
                }
            } finally {
                setLoading(false);
            }
        };

        if (quizCode) {
            fetchQuiz();
        } else {
             setError("No quiz code specified in URL.");
             setLoading(false);
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizCode, navigate]); // Re-fetch only if quizCode changes

    // --- Event Handlers ---

    // Handle Option Selection for the current question
    const handleOptionSelect = (index) => {
        // Allow selection only if quiz is active and not submitting
        if (quizFinished || isSubmitting) return;

        setCurrentSelection(index); // Update visual selection for the current question

        // Update the stored answer for the current question index
        const updatedAnswers = [...selectedAnswers];
        updatedAnswers[currentQuestionIndex] = index;
        setSelectedAnswers(updatedAnswers);
    };

    // Handle "Next" or "Finish" button click
    const handleNextOrFinish = async () => {
        // If not the last question, move to the next one
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            // Restore the user's previous selection for the next question (if any)
            setCurrentSelection(selectedAnswers[currentQuestionIndex + 1]);
        } else {
            // Last question: Submit the answers to the backend
            setIsSubmitting(true);
            setError(null); // Clear previous submission errors
            try {
                 console.log("Submitting answers:", selectedAnswers);
                 // Backend endpoint expects { answers: [index1, index2, ...] }
                 const response = await axiosInstance.post(`/quizzes/${quizCode}/submit`, {
                    answers: selectedAnswers,
                });

                setFinalResult(response.data); // Store { message, score, maxScore, updatedTotalPoints }
                setQuizFinished(true); // Mark quiz as finished to show results screen

            } catch (err) {
                 console.error("Error submitting quiz:", err.response?.data || err.message);
                  if (err.response?.status === 401) { // Handle potential auth errors during submit
                     localStorage.removeItem('quizAppToken');
                     localStorage.removeItem('quizAppUser');
                     navigate('/login');
                     return; // Stop execution
                 }
                 setError(err.response?.data?.message || "Failed to submit quiz results. Please try again.");
                 // Keep the user on the last question page if submission fails
            } finally {
                 setIsSubmitting(false); // Re-enable button
            }
        }
    };

    // --- Helper Data ---
    const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
    const currentQuestion = questions ? questions[currentQuestionIndex] : null;

    // --- Render Logic ---

    // Loading State
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="text-center p-10">
                    <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" /* ... SVG path ... */ viewBox="0 0 24 24"></svg>
                    Loading Quiz...
                </div>
            </div>
        );
    }

    // Error State
    if (error && !quiz) { // Show error only if quiz failed to load initially
        return (
            <div className="flex justify-center items-center min-h-screen bg-red-50 text-red-700">
                <div className="text-center p-10 max-w-md">
                    <i className="fas fa-exclamation-triangle fa-2x mb-3"></i>
                    <p className="font-semibold mb-2">Error Loading Quiz</p>
                    <p className="text-sm mb-4">{error}</p>
                    <Link to="/home" className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded text-sm">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    // Quiz data not loaded (should be covered by error/loading, but fallback)
    if (!quiz || !currentQuestion) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                 <div className="text-center p-10 text-gray-500">Quiz data is unavailable.</div>
            </div>
       );
    }

    // Quiz Finished View
    if (quizFinished && finalResult) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-100 via-teal-50 to-cyan-100 py-8 flex justify-center items-center px-4">
                <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center transform transition-all hover:scale-105 duration-300">
                    <i className="fas fa-trophy fa-3x mb-4 text-yellow-500"></i>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">Quiz Completed!</h2>
                    <p className="text-xl text-gray-700 mb-2">
                        Your score:
                    </p>
                    <p className="text-4xl font-bold mb-6">
                        <span className="text-green-600">{finalResult.score}</span>
                        <span className="text-gray-500 text-2xl"> / {finalResult.maxScore}</span>
                    </p>
                     <p className="text-md text-gray-600 mb-6 border-t pt-4">
                        Your total points are now: <span className="font-semibold text-indigo-700">{finalResult.updatedTotalPoints}</span>
                     </p>
                     {/* Display submission error if it occurred */}
                     {error && <p className="text-red-500 mb-4 text-sm">Error during submission: {error}</p>}
                    <button
                        onClick={() => navigate('/home')} // Navigate back to dashboard
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 transition-colors duration-300 shadow-md hover:shadow-lg"
                    >
                       <i className="fas fa-arrow-left mr-2"></i> Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }


    // --- Active Quiz Question View ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 py-6 px-4 sm:px-6 lg:px-8 flex justify-center items-start md:items-center">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden max-w-2xl w-full my-6">
                {/* Progress Bar */}
                <div className="relative h-3 bg-gray-200">
                    <div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-300 ease-linear rounded-r-full"
                        style={{ width: `${progress}%` }}
                    ></div>
                     <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs font-semibold text-gray-600">
                         {currentQuestionIndex + 1} / {questions.length}
                    </span>
                </div>

                {/* Quiz Content */}
                <div className="p-6 md:p-8">
                    {/* Question Title and Points */}
                    <div className="mb-4 text-sm text-gray-500">Quiz: {quiz.title}</div>
                    <h2 className="text-lg font-semibold text-gray-600 mb-2 flex justify-between items-center">
                        <span>Question {currentQuestionIndex + 1}</span>
                        <span className="font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full text-sm">{currentQuestion.points} Points</span>
                    </h2>

                    {/* Question Image (Optional) */}
                    {currentQuestion.image && (
                        <div className="my-4 p-2 border rounded-md bg-gray-50 flex justify-center">
                             <img src={currentQuestion.image} alt="Question visual aid" className="rounded max-h-60 w-auto object-contain" />
                        </div>
                    )}
                    {/* Question Text */}
                    <p className="text-xl text-gray-800 mb-6 font-medium">{currentQuestion.questionText}</p>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                className={`option-button flex items-center w-full p-4 rounded-lg border-2 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400
                                    ${currentSelection === index
                                        ? 'bg-indigo-100 border-indigo-500 ring-2 ring-indigo-400 scale-105 shadow-lg font-semibold text-indigo-800'
                                        : 'bg-white border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 text-gray-700'}
                                `}
                                onClick={() => handleOptionSelect(index)}
                                disabled={isSubmitting} // Disable while final submission is in progress
                            >
                                {/* Option Letter */}
                                <span className={`flex-shrink-0 w-6 h-6 mr-3 rounded-full border-2 flex items-center justify-center text-xs font-bold ${currentSelection === index ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-400 text-gray-500'}`}>
                                    {String.fromCharCode(65 + index)}
                                </span>
                                {/* Option Text */}
                                <span>{option}</span>
                            </button>
                        ))}
                    </div>

                    {/* Error display during quiz (e.g., submission error) */}
                    {error && <p className="text-red-500 mb-4 text-center text-sm font-medium">{error}</p>}

                    {/* Next/Finish Button */}
                    <button
                        onClick={handleNextOrFinish}
                        className={`w-full font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                            ${isSubmitting ? 'bg-gray-400 text-gray-700' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white disabled:from-gray-400 disabled:to-gray-500'}
                        `}
                        // Disable if no option is selected OR if submitting final answers
                        disabled={currentSelection === null || isSubmitting}
                    >
                        {isSubmitting ? (
                             <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                             </span>
                            ) : (
                                currentQuestionIndex < questions.length - 1
                                    ? (<>Next Question <i className="fas fa-arrow-right ml-2"></i></>)
                                    : (<>Finish Quiz <i className="fas fa-check-circle ml-2"></i></>)
                            )
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Play;