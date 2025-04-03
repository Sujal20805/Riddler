// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Using axios for cleaner API calls

// Helper function to generate initials for the avatar
const generateInitials = (title) => {
    if (!title) return '??';
    const words = title.trim().split(/\s+/);
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    } else if (words.length > 1) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return '??';
};

// Helper function to truncate text
const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
};

// Simple consistent color generation based on title length (can be more sophisticated)
const getAvatarColor = (title) => {
    const colors = [
        'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500',
        'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = (title?.length || 0) % colors.length;
    return colors[index];
}

const Dashboard = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingQuizzes, setLoadingQuizzes] = useState(true);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = 'http://localhost:5000/api'; // Adjust if your backend runs elsewhere

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                setLoadingQuizzes(true);
                setError(null);
                const response = await axios.get(`${API_BASE_URL}/quizzes`);
                setQuizzes(response.data);
            } catch (err) {
                console.error("Error fetching quizzes:", err);
                setError('Failed to load quizzes. Please try again later.');
            } finally {
                setLoadingQuizzes(false);
            }
        };

        const fetchLeaderboard = async () => {
            try {
                setLoadingLeaderboard(true);
                // No specific error state for leaderboard, piggyback on general error
                const response = await axios.get(`${API_BASE_URL}/users/leaderboard`);
                setLeaderboard(response.data);
            } catch (err) {
                console.error("Error fetching leaderboard:", err);
                // Optionally set a specific leaderboard error
                setError(prev => prev || 'Failed to load leaderboard.'); // Add error if none exists
            } finally {
                setLoadingLeaderboard(false);
            }
        };

        fetchQuizzes();
        fetchLeaderboard();
    }, []); // Empty dependency array means this runs once on mount

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

                 {/* Display Error if any */}
                 {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline"> {error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Quiz Grid */}
                    <div className="md:col-span-3">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Available Quizzes</h2>
                        {loadingQuizzes ? (
                             <div className="text-center py-10 text-gray-600">Loading quizzes...</div>
                        ) : quizzes.length === 0 && !error ? (
                             <div className="text-center py-10 text-gray-600">No quizzes found. Why not create one?</div>
                         ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {quizzes.map((quiz) => (
                                    <Link key={quiz._id} to={`/quiz/${quiz.quizCode}`} className="block"> {/* Link using quizCode or _id */}
                                        <div className="bg-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition duration-300 cursor-pointer h-64 flex flex-col overflow-hidden">
                                            {/* Avatar Section */}
                                            <div className={`w-full h-28 flex items-center justify-center ${getAvatarColor(quiz.title)}`}>
                                                <span className="text-4xl font-bold text-white">
                                                    {generateInitials(quiz.title)}
                                                </span>
                                            </div>
                                            {/* Content Section */}
                                            <div className="p-4 flex flex-col justify-between flex-grow">
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-1 text-gray-900 truncate" title={quiz.title}>
                                                        {truncateText(quiz.title, 30)}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm mb-2 h-10 overflow-hidden"> {/* Fixed height for description */}
                                                        {truncateText(quiz.description, 60)} {/* Truncate description */}
                                                    </p>
                                                </div>
                                                <span className="text-blue-500 font-medium text-sm mt-auto self-start">
                                                    Start Quiz →
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                         )}
                    </div>

                    {/* Leaderboard */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-5 sticky top-4">
                            <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Top Players</h2>
                            {loadingLeaderboard ? (
                                <div className="text-center py-5 text-gray-500 text-sm">Loading leaderboard...</div>
                            ) : leaderboard.length === 0 ? (
                                 <div className="text-center py-5 text-gray-500 text-sm">No leaderboard data available yet.</div>
                             ) : (
                                <ul className="divide-y divide-gray-200">
                                    {leaderboard.map((user, index) => (
                                        <li key={user.username || index} className="py-2 flex justify-between items-center">
                                            <span className="text-gray-800 truncate pr-2" title={user.username}>{index + 1}. {user.username}</span>
                                            <span className="text-gray-800 font-medium whitespace-nowrap">{user.totalPoints} pts</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                             {/* Keep the link even if data is loading/empty */}
                             <div className="mt-4 pt-4 border-t">
                                <Link to="/leaderboard" className="block text-center text-sm text-blue-500 hover:text-blue-700 font-medium">
                                    View Full Leaderboard
                                 </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;