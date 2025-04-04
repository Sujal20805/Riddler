import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance'; // Assuming same path as Dashboard

// Helper function to get rank-specific styling (optional but nice)
const getRankClass = (rank) => {
    switch (rank) {
        case 1:
            return 'bg-yellow-100 text-yellow-800 border-yellow-400'; // Gold
        case 2:
            return 'bg-gray-200 text-gray-800 border-gray-400';    // Silver
        case 3:
            return 'bg-orange-100 text-orange-800 border-orange-400'; // Bronze
        default:
            return 'bg-gray-100 text-gray-700 border-gray-300';     // Default
    }
};

const Leaderboard = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Function to check auth and potentially logout (same as Dashboard)
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

        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                setError(null);
                // Fetch the full leaderboard - remove or adjust limit as needed
                const response = await axiosInstance.get('/users/leaderboard'); // Fetch all or a larger limit
                setLeaderboardData(response.data);
            } catch (err) {
                console.error("Error fetching leaderboard:", err.response?.data || err.message);
                 if (!handleAuthError(err)) {
                    setError('Failed to load leaderboard data. Please try again later.');
                 }
            } finally {
                 // Delay slightly for smoother transition
                 setTimeout(() => setLoading(false), 300);
            }
        };

        // Check for token before fetching
        if (!localStorage.getItem('quizAppToken')) {
            navigate('/login');
            return; // Prevent fetching if not logged in
        }

        fetchLeaderboard();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    // Loading state: Spinner (alternative to skeletons for a full page)
    const renderLoadingSpinner = () => (
        <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <span className="ml-4 text-gray-600">Loading Leaderboard...</span>
        </div>
    );

    // Skeleton Loader for list items (more detailed than dashboard's mini version)
    const renderLeaderboardSkeletons = (count = 10) => (
        <div className="space-y-3 animate-pulse">
            {Array.from({ length: count }).map((_, index) => (
                 <div key={index} className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                    <div className="flex items-center space-x-4">
                         <div className="h-6 w-6 bg-gray-300 rounded-md"></div> {/* Rank placeholder */}
                         <div className="h-5 bg-gray-300 rounded w-32 md:w-48"></div> {/* Username placeholder */}
                    </div>
                     <div className="h-5 bg-gray-300 rounded w-16 md:w-20"></div> {/* Points placeholder */}
                 </div>
            ))}
        </div>
    );


    return (
        <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen p-4 md:p-8 font-sans">
            <div className="container mx-auto max-w-4xl">

                {/* Back Link */}
                <div className="mb-6">
                    <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-800 transition duration-200 text-sm">
                         <i className="fas fa-arrow-left mr-2"></i>Back to Dashboard
                    </Link>
                </div>

                {/* Main Leaderboard Card */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200/50">
                     <div className="p-5 md:p-8 border-b border-gray-200 bg-gray-50/50">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                             <i className="fas fa-trophy text-yellow-500 mr-3 text-xl"></i>
                             Leaderboard
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">See who's topping the charts!</p>
                     </div>

                     <div className="p-5 md:p-6">
                         {/* Display Error if any */}
                         {error && !loading && (
                            <div className="mb-6 bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded relative shadow-sm" role="alert">
                                <strong className="font-bold block">Oops!</strong>
                                <span>{error}</span>
                            </div>
                         )}

                         {/* Loading State */}
                         {loading ? (
                            // You can choose between spinner or skeletons
                            // renderLoadingSpinner()
                            renderLeaderboardSkeletons(10)
                         ) : leaderboardData.length === 0 && !error ? (
                             <div className="text-center py-10 px-6 text-gray-500">
                                <i className="fas fa-users fa-2x mb-3 text-gray-400"></i>
                                <p>The leaderboard is empty right now.</p>
                                <p className='mt-1 text-sm'>Play some quizzes to get started!</p>
                             </div>
                         ) : (
                            /* Leaderboard List */
                            <ul className="space-y-3">
                                {leaderboardData.map((user, index) => (
                                    <li
                                        key={user._id || index}
                                        className={`flex items-center justify-between p-3.5 md:p-4 rounded-lg border 
                                                   transition duration-300 ease-in-out transform 
                                                   hover:scale-[1.02] hover:shadow-md hover:border-indigo-300 hover:bg-indigo-50/50
                                                   ${getRankClass(index + 1)}`} // Apply rank-specific background/border
                                    >
                                        <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                                            {/* Rank Number */}
                                            <span className={`flex-shrink-0 w-8 h-8 md:w-9 md:h-9 rounded-md flex items-center justify-center 
                                                              font-bold text-sm border ${getRankClass(index + 1)} shadow-sm`}>
                                                {index + 1}
                                            </span>

                                            {/* User Info */}
                                            <div className="flex-1 min-w-0">
                                                 <p className="text-sm md:text-base font-semibold text-gray-800 truncate" title={user.username}>
                                                    {/* Optional: Add avatar here if available */}
                                                    {user.username}
                                                 </p>
                                                 {/* Optionally display join date or other info */}
                                                 {/* <p className="text-xs text-gray-500">Joined: {new Date(user.createdAt).toLocaleDateString()}</p> */}
                                            </div>
                                        </div>

                                        {/* Points */}
                                        <div className="flex-shrink-0 ml-3 text-right">
                                            <span className="text-sm md:text-base font-bold text-indigo-700">
                                                {user.totalPoints}
                                            </span>
                                            <span className="text-xs text-indigo-600/80 block md:inline md:ml-1">pts</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                         )}
                     </div>
                </div>
                 {/* Optional: Add pagination controls here if leaderboard becomes very large */}
            </div>
        </div>
    );
};

export default Leaderboard;