import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Avatar from './ui/Avatar';
import Skeleton from './ui/Skeleton';

const getRankTheme = (rank) => {
    switch (rank) {
        case 1:
            return { variant: 'volt', label: '① ST' };
        case 2:
            return { variant: 'pink', label: '② ND' };
        case 3:
            return { variant: 'cyan', label: '③ RD' };
        default:
            return { variant: 'zinc', label: `${rank} TH` };
    }
};

const Leaderboard = () => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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

        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axiosInstance.get('/users/leaderboard');
                setLeaderboardData(response.data);
            } catch (err) {
                console.error("Error fetching leaderboard:", err.response?.data || err.message);
                if (!handleAuthError(err)) {
                    setError('Failed to load leaderboard data. Please try again later.');
                }
            } finally {
                setTimeout(() => setLoading(false), 300);
            }
        };

        if (!localStorage.getItem('quizAppToken')) {
            navigate('/login');
            return;
        }

        fetchLeaderboard();
    }, [navigate]);

    const renderLeaderboardSkeletons = (count = 8) => (
        <div className="space-y-4 animate-pulse">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-zinc-900 border-[3px] border-black shadow-[3px_3px_0px_0px_#000000]">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-9 w-9" />
                        <Skeleton className="h-6 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-950 text-white scanlines game-dot-grid p-4 md:p-8 font-sans animate-scanline-laser">
            <div className="container mx-auto max-w-2xl z-10 relative animate-slide-up">

                {/* Back Link */}
                <div className="mb-6">
                    <Link
                        to="/home"
                        className="inline-flex items-center font-heading font-black text-xs uppercase tracking-wider text-volt hover:underline"
                    >
                        <i className="fa-solid fa-arrow-left-long mr-2" /> RETURN TO BOARD
                    </Link>
                </div>

                {/* Main Card */}
                <Card variant="black">
                    <div className="border-b-[3px] border-black pb-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <div className="inline-block px-2.5 py-0.5 border-2 border-black bg-neon-pink text-white font-heading text-xs font-black uppercase tracking-wider mb-2">
                                OPERATIONAL HONORS
                            </div>
                            <h1 className="text-3xl font-black uppercase text-white font-heading tracking-wide flex items-center gap-2">
                                <i className="fa-solid fa-trophy text-volt"></i> GLOBAL LEADERBOARD
                            </h1>
                            <p className="text-zinc-500 text-xs mt-1 font-body">
                                Official ranking of verified player records and total points accumulated.
                            </p>
                        </div>
                    </div>

                    {error && !loading && (
                        <div className="mb-6 bg-neon-pink border-[3px] border-black text-white px-4 py-3 shadow-[4px_4px_0_0_#000] font-heading font-extrabold uppercase tracking-wide flex items-center gap-2" role="alert">
                            <i className="fa-solid fa-triangle-exclamation"></i>
                            <span>ERROR: {error}</span>
                        </div>
                    )}

                    {loading ? (
                        renderLeaderboardSkeletons(8)
                    ) : leaderboardData.length === 0 && !error ? (
                        <div className="text-center py-10 px-6 border-[3px] border-black bg-zinc-950 text-zinc-500">
                            <i className="fa-solid fa-users fa-2x mb-3 text-zinc-600"></i>
                            <p className="font-heading font-black uppercase text-sm">NO LOGS AVAILABLE</p>
                            <p className="text-xs text-zinc-600 mt-1 font-body">Earn score multiplier tokens inside quiz rooms.</p>
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {leaderboardData.map((user, index) => {
                                const rank = index + 1;
                                const rankTheme = getRankTheme(rank);

                                // Specific style highlighting top 3
                                const rankColor =
                                    rank === 1 ? 'border-volt bg-volt/5 shadow-[4px_4px_0px_0px_#ccff00]' :
                                        rank === 2 ? 'border-neon-pink bg-neon-pink/5 shadow-[4px_4px_0px_0px_#ec4899]' :
                                            rank === 3 ? 'border-neon-cyan bg-neon-cyan/5 shadow-[4px_4px_0px_0px_#06b6d4]' :
                                                'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]';

                                return (
                                    <li
                                        key={user._id || index}
                                        className={`flex items-center justify-between p-3.5 bg-zinc-900 border-[3px] transition-all hover:scale-[1.01] ${rankColor}`}
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            {/* Rank tag */}
                                            <Badge variant={rankTheme.variant} className="w-14 items-center justify-center py-1">
                                                {rankTheme.label}
                                            </Badge>

                                            {/* Avatar initials */}
                                            <Avatar title={user.username} size="sm" className="hidden sm:inline-flex shrink-0" />

                                            {/* Username */}
                                            <div className="min-w-0">
                                                <span className="font-heading font-extrabold text-sm md:text-base text-zinc-100 truncate block uppercase max-w-[150px] sm:max-w-xs">
                                                    {user.username}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Score */}
                                        <div className="text-right">
                                            <span className="font-heading font-black text-base md:text-xl text-volt block">
                                                {user.totalPoints} <span className="text-[10px] text-zinc-500 font-bold uppercase font-mono">PTS</span>
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Leaderboard;