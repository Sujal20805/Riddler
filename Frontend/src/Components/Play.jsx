// Play.jsx
import React, { useState, useEffect } from 'react';

const Play = () => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [score, setScore] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [correctAnswerIndex, setCorrectAnswerIndex] = useState(null);
    const [quizFinished, setQuizFinished] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [progress, setProgress] = useState(0);

    // Demo Quiz Questions (JSON format as requested)
    const demoQuestions = [
        {
            id: 1,
            questionText: 'What is the capital of France?',
            options: ['London', 'Paris', 'Berlin', 'Rome'],
            correctAnswerIndex: 1, // Paris is at index 1
            points: 10,
        },
        {
            id: 2,
            questionText: 'Which planet is known as the "Red Planet"?',
            options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
            correctAnswerIndex: 1, // Mars is at index 1
            points: 10,
        },
        {
            id: 3,
            questionText: 'What is the largest mammal in the world?',
            options: ['African Elephant', 'Blue Whale', 'Giraffe', 'Polar Bear'],
            correctAnswerIndex: 1, // Blue Whale is at index 1
            points: 10,
        },
        {
            id: 4,
            questionText: 'How many continents are there?',
            options: ['Five', 'Six', 'Seven', 'Eight'],
            correctAnswerIndex: 2, // Seven continents
            points: 10,
        },
        {
            id: 5,
            questionText: 'What is the chemical symbol for water?',
            options: ['Wa', 'H2O', 'CO2', 'O2'],
            correctAnswerIndex: 1, // H2O
            points: 10,
        },
    ];

    // Demo Leaderboard Data
    const demoLeaderboard = [
        { name: 'Alice', score: 40 },
        { name: 'Bob', score: 30 },
        { name: 'Charlie', score: 20 },
        { name: 'David', score: 10 },
        { name: 'Eve', score: 0 },
    ];

    useEffect(() => {
        // Simulate fetching questions from backend (using demo questions)
        setQuestions(demoQuestions);
        setLeaderboardData(demoLeaderboard); // Load demo leaderboard
    }, []);

    useEffect(() => {
        if (questions.length > 0) {
            setProgress(((currentQuestionIndex + 1) / questions.length) * 100);
        }
    }, [currentQuestionIndex, questions.length]);


    const handleOptionSelect = (index) => {
        if (showFeedback || quizFinished) return; // Prevent re-selection after feedback or quiz completion

        setSelectedOption(index);
        const isCorrect = index === questions[currentQuestionIndex].correctAnswerIndex;
        setCorrectAnswerIndex(questions[currentQuestionIndex].correctAnswerIndex);

        if (isCorrect) {
            setScore(score + questions[currentQuestionIndex].points);
            setFeedbackMessage('Correct!');
        } else {
            setFeedbackMessage('Incorrect!');
        }
        setShowFeedback(true);
    };

    const handleNextQuestion = () => {
        setShowFeedback(false);
        setSelectedOption(null);
        setCorrectAnswerIndex(null);
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setQuizFinished(true);
        }
    };

    const currentQuestion = questions[currentQuestionIndex];

    if (!currentQuestion) {
        return <div className="text-center text-gray-700 py-10">Loading quiz...</div>;
    }

    if (quizFinished) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 py-6 flex justify-center items-center">
                <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4 animate-pulse">Quiz Finished!</h2>
                    <p className="text-lg text-gray-700 mb-6">Your final score is: <span className="font-semibold text-blue-600">{score}</span> out of {questions.length * 10}</p>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Leaderboard</h3>
                    <ul className="mb-6">
                        {leaderboardData.sort((a, b) => b.score - a.score).map((entry, index) => (
                            <li key={index} className="py-2">
                                <span className="font-medium">{index + 1}. {entry.name}</span> - <span className="text-green-500">{entry.score}</span> points
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={() => { setQuizFinished(false); setCurrentQuestionIndex(0); setScore(0); setProgress(0); setShowFeedback(false); setSelectedOption(null); setCorrectAnswerIndex(null); }}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-300"
                    >
                        Play Again
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 py-6 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden max-w-xl w-full">
                {/* Progress Bar */}
                <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                        className="bg-green-500 h-full rounded-full transition-width duration-500 ease-in-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <div className="p-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">{`Question ${currentQuestionIndex + 1}/${questions.length}`}</h2>

                    {currentQuestion.image && (
                        <img src={currentQuestion.image} alt="Question Image" className="mb-4 rounded-md max-h-48 w-full object-contain" />
                    )}
                    <p className="text-lg text-gray-700 mb-6">{currentQuestion.questionText}</p>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        {currentQuestion.options.map((option, index) => (
                            <button
                                key={index}
                                className={`option-button block w-full p-4 rounded-md border-2 border-gray-300 text-left hover:border-blue-500 focus:outline-none transition-colors duration-300
                                    ${showFeedback && index === correctAnswerIndex ? 'bg-green-100 border-green-500 text-green-700 font-semibold' : ''}
                                    ${showFeedback && selectedOption === index && index !== correctAnswerIndex ? 'bg-red-100 border-red-500 text-red-700 line-through' : ''}
                                    ${selectedOption === index && !showFeedback ? 'bg-blue-50 border-blue-500' : ''}
                                `}
                                onClick={() => handleOptionSelect(index)}
                                disabled={showFeedback}
                            >
                                <span className="font-semibold">{String.fromCharCode(65 + index)}.</span> {option}
                                {showFeedback && index === correctAnswerIndex && <i className="fas fa-check ml-2 text-green-500"></i>}
                                {showFeedback && selectedOption === index && index !== correctAnswerIndex && <i className="fas fa-times ml-2 text-red-500"></i>}
                            </button>
                        ))}
                    </div>

                    {showFeedback && (
                        <div className="mb-6 p-4 rounded-md bg-gray-50 border border-gray-200">
                            <p className={`font-semibold ${selectedOption === correctAnswerIndex ? 'text-green-700' : 'text-red-700'} mb-2`}>{feedbackMessage}</p>
                            <p className="text-gray-600">
                                {selectedOption !== correctAnswerIndex && <span>Correct answer was: <span className="font-semibold">{String.fromCharCode(65 + correctAnswerIndex)}. {currentQuestion.options[correctAnswerIndex]}</span></span>}
                            </p>
                        </div>
                    )}

                    {showFeedback && (
                        <button
                            onClick={handleNextQuestion}
                            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-300"
                        >
                            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Play;