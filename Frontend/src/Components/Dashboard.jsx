import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

// Helper function to generate initials for the avatar
const generateInitials = (title) => {
    if (!title) return '??';
    const words = title.trim().split(/\s+/);
    if (words.length === 1) {
        // Take first two letters if single word
        return words[0].substring(0, 2).toUpperCase();
    } else if (words.length > 1) {
        // Take first letter of first two words
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return '??'; // Fallback
};

// Helper function to truncate text
const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
};

// Simple consistent color generation based on title length
const getAvatarColor = (title) => {
    const colors = [
        'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500',
        'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
        'bg-cyan-500', 'bg-orange-500' // Added more colors
    ];
    // Use char codes sum for a bit more variation
    let hash = 0;
    for (let i = 0; i < (title?.length || 0); i++) {
        hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash % colors.length);
    return colors[index];
}

const Dashboard = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingQuizzes, setLoadingQuizzes] = useState(true);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Function to check auth and potentially logout
        const handleAuthError = (err) => {
            if (err.response?.status === 401) {
                console.error("Authentication error. Logging out.");
                localStorage.removeItem('quizAppToken');
                localStorage.removeItem('quizAppUser');
                navigate('/login');
                return true; // Indicate auth error was handled
            }
            return false; // Indicate other error
        };

        const fetchQuizzes = async () => {
            try {
                setLoadingQuizzes(true);
                setError(null);
                const response = await axiosInstance.get('/quizzes');
                setQuizzes(response.data);
            } catch (err) {
                console.error("Error fetching quizzes:", err.response?.data || err.message);
                if (!handleAuthError(err)) {
                     setError('Failed to load quizzes. Please try again later.');
                }
            } finally {
                // Delay slightly to prevent flash of loading state if data loads quickly
                 setTimeout(() => setLoadingQuizzes(false), 200);
            }
        };

        const fetchLeaderboard = async () => {
            try {
                setLoadingLeaderboard(true);
                const response = await axiosInstance.get('/users/leaderboard?limit=5'); // Get top 5
                setLeaderboard(response.data);
            } catch (err) {
                console.error("Error fetching leaderboard:", err.response?.data || err.message);
                 if (!handleAuthError(err)) {
                    // Don't overwrite quiz error if it exists
                    setError(prev => prev || 'Failed to load leaderboard.');
                 }
            } finally {
                 setTimeout(() => setLoadingLeaderboard(false), 200);
            }
        };

        // Check for token before fetching
        if (!localStorage.getItem('quizAppToken')) {
            navigate('/login');
            return; // Prevent fetching if not logged in
        }

        fetchQuizzes();
        fetchLeaderboard();

    // Only include navigate in dependencies, fetch functions are defined inside
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    const handlePlayQuiz = (quizCode) => {
        if (quizCode) {
            navigate(`/play/${quizCode}`);
        } else {
            console.error("Cannot play quiz: Missing quiz code.");
            // Optionally show an error to the user
        }
    };

    // Loading state for the main content area
    const renderLoadingSkeletons = (count = 3) => (
        Array.from({ length: count }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md h-64 flex flex-col overflow-hidden animate-pulse">
                <div className="w-full h-28 bg-gray-300"></div>
                <div className="p-4 flex flex-col justify-between flex-grow space-y-3">
                    <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                    <div className="flex justify-between items-center mt-auto self-stretch pt-2">
                        <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    </div>
                </div>
            </div>
        ))
    );

     // Loading state for leaderboard
     const renderLeaderboardSkeletons = (count = 5) => (
        <ul className="divide-y divide-gray-200 animate-pulse">
            {Array.from({ length: count }).map((_, index) => (
                <li key={index} className="py-3 flex justify-between items-center">
                    <div className="h-4 bg-gray-300 rounded w-2/5"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                </li>
            ))}
        </ul>
    );

    return (
        <div className="bg-gray-100 min-h-screen p-4 md:p-8 font-sans">
            <div className="container mx-auto max-w-7xl">
                {/* Create Quiz Card */}
                <Link to="/build" className="block mb-8 group">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 cursor-pointer group-hover:scale-[1.02]">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold mb-1">Create Your Own Quiz</h2>
                                <p className="text-lg hidden md:block opacity-80">Unleash your creativity!</p>
                            </div>
                            <div className="text-purple-100 group-hover:text-white transition-colors duration-200 group-hover:animate-pulse">
                                <i className="fa fa-plus-circle text-4xl"></i>
                            </div>
                        </div>
                    </div>
                </Link>

                 {/* Display Error if any */}
                 {error && (
                    <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded relative shadow" role="alert">
                        <strong className="font-bold block">Error:</strong>
                        <span>{error}</span>
                    </div>
                 )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
                    {/* Quiz Grid */}
                    <div className="lg:col-span-3">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Available Quizzes</h2>
                        {loadingQuizzes ? (
                             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {renderLoadingSkeletons(3)}
                             </div>
                        ) : quizzes.length === 0 && !error ? (
                             <div className="text-center py-10 px-6 bg-white rounded-lg shadow border border-gray-200 text-gray-500">
                                <i className="fas fa-search fa-2x mb-3 text-gray-400"></i>
                                <p>No quizzes found. Why not <Link to="/build" className='text-indigo-500 hover:underline font-medium'>create one</Link>?</p>
                             </div>
                         ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {quizzes.map((quiz) => (
                                    // Use onClick to navigate programmatically
                                    <div key={quiz._id} onClick={() => handlePlayQuiz(quiz.quizCode)}
                                         className="block cursor-pointer group rounded-xl bg-white shadow-md hover:shadow-lg transition duration-300 overflow-hidden border border-transparent hover:border-indigo-300"
                                         title={`Play "${quiz.title}"`}>
                                        <div className="h-full flex flex-col">
                                            {/* Avatar Section */}
                                            <div className={`w-full h-28 flex items-center justify-center ${getAvatarColor(quiz.title)} transition-transform duration-300 group-hover:scale-105`}>
                                                <span className="text-4xl font-bold text-white opacity-90">
                                                    {generateInitials(quiz.title)}
                                                </span>
                                            </div>
                                            {/* Content Section */}
                                            <div className="p-4 flex flex-col justify-between flex-grow">
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-1 text-gray-800 group-hover:text-indigo-600 truncate" title={quiz.title}>
                                                        {truncateText(quiz.title, 35)}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm mb-2 h-10 overflow-hidden" title={quiz.description || 'No description'}>
                                                        {truncateText(quiz.description, 60) || <span className='italic'>No description</span>}
                                                    </p>
                                                </div>
                                                 <div className="flex justify-between items-center mt-auto self-stretch border-t pt-3">
                                                    <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded">
                                                        {quiz.questionCount} Qs • {quiz.totalPoints} pts
                                                    </span>
                                                    <span className="text-indigo-500 group-hover:text-indigo-700 font-semibold text-sm flex items-center">
                                                        Play Quiz <i className="fas fa-arrow-right ml-1 text-xs transition-transform duration-200 group-hover:translate-x-1"></i>
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
                    <div className="lg:col-span-1">
                        {/* Sticky positioning for leaderboard on larger screens */}
                        <div className="bg-white rounded-xl shadow-md p-5 lg:sticky lg:top-6 border border-gray-200">
                            <h2 className="text-lg font-bold mb-3 text-gray-700 border-b pb-2">Top Players</h2>
                            {loadingLeaderboard ? (
                                renderLeaderboardSkeletons(5)
                            ) : leaderboard.length === 0 ? (
                                 <div className="text-center py-5 text-gray-500 text-sm">No leaderboard data yet.</div>
                             ) : (
                                <ul className="divide-y divide-gray-100">
                                    {leaderboard.map((user, index) => (
                                        <li key={user._id || index} className="py-2.5 flex justify-between items-center text-sm">
                                            <span className="text-gray-700 truncate pr-2 flex items-center">
                                                <span className={`font-semibold mr-2 ${index < 3 ? 'text-indigo-600' : 'text-gray-500'}`}>{index + 1}.</span>
                                                {/* Optional: Add avatar here */}
                                                {user.username}
                                            </span>
                                            <span className="text-gray-800 font-medium whitespace-nowrap bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-xs">
                                                {user.totalPoints} pts
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                             {/* Link to full leaderboard */}
                             <div className="mt-4 pt-3 border-t border-gray-100">
                                <Link to="/leaderboard" className="block text-center text-sm text-indigo-500 hover:text-indigo-700 font-medium hover:underline">
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