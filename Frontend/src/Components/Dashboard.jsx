// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import axiosInstance from '../api/axiosInstance'; // Use the instance

// ... (Keep helper functions: generateInitials, truncateText, getAvatarColor) ...

const Dashboard = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingQuizzes, setLoadingQuizzes] = useState(true);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // For navigation

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                setLoadingQuizzes(true);
                setError(null);
                // No need for full URL, axiosInstance handles base URL and token
                const response = await axiosInstance.get('/quizzes');
                setQuizzes(response.data);
            } catch (err) {
                console.error("Error fetching quizzes:", err.response?.data || err.message);
                setError('Failed to load quizzes. Please try again later.');
                // Handle unauthorized (e.g., token expired) - redirect to login
                if (err.response?.status === 401) {
                    localStorage.removeItem('quizAppToken');
                    localStorage.removeItem('quizAppUser');
                    navigate('/login');
                }
            } finally {
                setLoadingQuizzes(false);
            }
        };

        const fetchLeaderboard = async () => {
            try {
                setLoadingLeaderboard(true);
                const response = await axiosInstance.get('/users/leaderboard?limit=5'); // Get top 5 for dashboard
                setLeaderboard(response.data);
            } catch (err) {
                console.error("Error fetching leaderboard:", err.response?.data || err.message);
                setError(prev => prev || 'Failed to load leaderboard.'); // Add error if none exists
                 if (err.response?.status === 401) { // Also check auth for leaderboard if needed
                    // Handle logout if necessary
                }
            } finally {
                setLoadingLeaderboard(false);
            }
        };

        fetchQuizzes();
        fetchLeaderboard();
    }, [navigate]); // Add navigate to dependency array

    const handlePlayQuiz = (quizCode) => {
        navigate(`/play/${quizCode}`); // Navigate to Play page with quizCode
    }

    return (
        <div className="bg-gray-100 min-h-screen p-4 md:p-8">
            <div className="container mx-auto max-w-7xl">
                {/* Create Quiz Card */}
                <Link to="/build"> {/* Updated link to /build */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 mb-8 cursor-pointer">
                        {/* ... content ... */}
                         <div className="text-blue-100 hover:text-white transition-colors duration-200">
                             <i className="fa fa-plus-circle text-4xl"></i> {/* Using FontAwesome */}
                         </div>
                    </div>
                </Link>

                 {/* Error Display */}
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
                        {/* ... Loading/No Quizzes States ... */}
                         {(!loadingQuizzes && quizzes.length > 0) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {quizzes.map((quiz) => (
                                    // Use onClick to navigate programmatically
                                    <div key={quiz._id} onClick={() => handlePlayQuiz(quiz.quizCode)}
                                         className="block cursor-pointer">
                                        <div className="bg-white rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition duration-300 h-64 flex flex-col overflow-hidden">
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
                                                        {truncateText(quiz.title, 30)} ({quiz.questionCount} Qs) {/* Show question count */}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm mb-2 h-10 overflow-hidden">
                                                        {truncateText(quiz.description, 60)}
                                                    </p>
                                                </div>
                                                 <div className="flex justify-between items-center mt-auto self-stretch">
                                                    <span className="text-xs text-gray-500">{quiz.totalPoints} Points</span>
                                                    <span className="text-blue-500 font-medium text-sm">
                                                        Play Quiz →
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         )}
                    </div>

                    {/* Leaderboard */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-5 sticky top-4">
                           {/* ... Loading/No Leaderboard States ... */}
                            {(!loadingLeaderboard && leaderboard.length > 0) && (
                                <ul className="divide-y divide-gray-200">
                                    {leaderboard.map((user, index) => (
                                        <li key={user._id || index} className="py-2 flex justify-between items-center">
                                            <span className="text-gray-800 truncate pr-2" title={user.username}>{index + 1}. {user.username}</span>
                                            <span className="text-gray-800 font-medium whitespace-nowrap">{user.totalPoints} pts</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
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