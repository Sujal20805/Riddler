// Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    // Dummy data for quiz cards (3 rows)
    const quizData = [
        [
            { id: 1, title: 'General Knowledge', topic: 'general', image: 'https://via.placeholder.com/200x150/3498db/ffffff?text=General+Knowledge' },
            { id: 2, title: 'Science Quiz', topic: 'science', image: 'https://via.placeholder.com/200x150/2ecc71/ffffff?text=Science' },
            { id: 3, title: 'History Trivia', topic: 'history', image: 'https://via.placeholder.com/200x150/e74c3c/ffffff?text=History' },
            { id: 4, title: 'Math Challenge', topic: 'math', image: 'https://via.placeholder.com/200x150/f39c12/ffffff?text=Math' },
        ],
        [
            { id: 5, title: 'Geography Quiz', topic: 'geography', image: 'https://via.placeholder.com/200x150/9b59b6/ffffff?text=Geography' },
            { id: 6, title: 'Literature Test', topic: 'literature', image: 'https://via.placeholder.com/200x150/1abc9c/ffffff?text=Literature' },
            { id: 7, title: 'Pop Culture', topic: 'pop_culture', image: 'https://via.placeholder.com/200x150/e67e22/ffffff?text=Pop+Culture' },
            { id: 8, title: 'Coding Quiz', topic: 'coding', image: 'https://via.placeholder.com/200x150/7f8c8d/ffffff?text=Coding' },
        ],
        [
            { id: 9, title: 'Music Theory', topic: 'music', image: 'https://via.placeholder.com/200x150/2c3e50/ffffff?text=Music' },
            { id: 10, title: 'Art History', topic: 'art', image: 'https://via.placeholder.com/200x150/d35400/ffffff?text=Art' },
            { id: 11, title: 'Sports Quiz', topic: 'sports', image: 'https://via.placeholder.com/200x150/27ae60/ffffff?text=Sports' },
            { id: 12, title: 'Movie Trivia', topic: 'movies', image: 'https://via.placeholder.com/200x150/8e44ad/ffffff?text=Movies' },
        ],
    ];

    // Dummy leaderboard data
    const leaderboardData = {
        quizName: 'General Knowledge Quiz',
        date: '2024-07-28',
        topScores: [
            { username: 'User1', score: 95 },
            { username: 'User2', score: 92 },
            { username: 'User3', score: 88 },
        ],
    };

    return (
        <div className="bg-gray-100 min-h-screen p-4 md:p-8">
            <div className="container mx-auto max-w-7xl">
                {/* Create Quiz Card */}
                <Link to="/quiz-builder">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 mb-8 cursor-pointer">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold mb-1">Create Your Own Quiz</h2>
                                <p className="text-lg hidden md:block opacity-80">Unleash your creativity and build engaging quizzes!</p>
                            </div>
                            <div className="text-blue-100 hover:text-white transition-colors duration-200">
                                <i className="fa fa-plus-circle text-4xl"></i> {/* FontAwesome Plus Circle Icon */}
                            </div>
                        </div>
                    </div>
                </Link>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Quiz Card Carousels */}
                    <div className="md:col-span-3">
                        {quizData.map((row, rowIndex) => (
                            <div key={rowIndex} className="mb-8">
                                <h2 className="text-xl font-semibold mb-4 text-gray-800">Explore Quiz Category {rowIndex + 1}</h2>
                                <div className="flex overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-400 scrollbar-track-gray-200 -ml-2 md:-ml-0"> {/* Adjusted margin for better spacing */}
                                    {row.map((quiz) => (
                                        <Link key={quiz.id} to={`/quiz/${quiz.topic}`} className="mx-2 first:ml-0 last:mr-0 flex-none"> {/* Added route and spacing */}
                                            <div className="w-64 h-72 bg-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition duration-300 cursor-pointer">
                                                <img src={quiz.image} alt={quiz.title} className="w-full h-40 object-cover rounded-t-xl" />
                                                <div className="p-4 flex flex-col justify-between h-32">
                                                    <div>
                                                        <h3 className="text-lg font-semibold mb-2 text-gray-900 truncate">{quiz.title}</h3>
                                                        <p className="text-gray-600 text-sm truncate">{quiz.topic.replace('_', ' ').toUpperCase()}</p>
                                                    </div>
                                                    <span className="text-blue-500 font-medium text-sm mt-2">Start Quiz →</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Leaderboard */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-5 sticky top-4"> {/* Made leaderboard sticky and adjusted padding */}
                            <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Quiz Leaderboard</h2>
                            <div className="mb-3">
                                <p className="text-gray-700 font-medium">Quiz: <span className="text-gray-900">{leaderboardData.quizName}</span></p>
                                <p className="text-gray-700 text-sm">Date: {leaderboardData.date}</p>
                            </div>
                            <ul className="divide-y divide-gray-200">
                                {leaderboardData.topScores.map((score, index) => (
                                    <li key={index} className="py-2 flex justify-between items-center">
                                        <span className="text-gray-800">{score.username}</span>
                                        <span className="text-gray-800 font-medium">{score.score}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 pt-4 border-t">
                                <Link to="/leaderboard" className="block text-center text-sm text-blue-500 hover:text-blue-700 font-medium">View Full Leaderboard</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;