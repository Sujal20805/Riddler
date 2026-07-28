import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';
import Avatar from './ui/Avatar';
import Skeleton from './ui/Skeleton';

// Helper function to truncate text
const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

const Dashboard = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingQuizzes, setLoadingQuizzes] = useState(true);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const currentUser = JSON.parse(localStorage.getItem('quizAppUser') || '{}');

    useEffect(() => {
        const handleAuthError = (err) => {
            if (err.response?.status === 401) {
                console.error("Authenication error. Logging out.");
                localStorage.removeItem('quizAppToken');
                localStorage.removeItem('quizAppUser');
                navigate('/login');
                return true;
            }
            return false;
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
                setTimeout(() => setLoadingQuizzes(false), 200);
            }
        };

        const fetchLeaderboard = async () => {
            try {
                setLoadingLeaderboard(true);
                const response = await axiosInstance.get('/users/leaderboard?limit=5');
                setLeaderboard(response.data);
            } catch (err) {
                console.error("Error fetching leaderboard:", err.response?.data || err.message);
                if (!handleAuthError(err)) {
                    setError(prev => prev || 'Failed to load leaderboard.');
                }
            } finally {
                setTimeout(() => setLoadingLeaderboard(false), 200);
            }
        };

        if (!localStorage.getItem('quizAppToken')) {
            navigate('/login');
            return;
        }

        fetchQuizzes();
        fetchLeaderboard();
    }, [navigate]);

    const handlePlayQuiz = (quizCode) => {
        if (quizCode) {
            navigate(`/play/${quizCode}`);
        } else {
            console.error("Missing quiz code.");
        }
    };

    const handleDeleteQuiz = async (e, quizCode, title) => {
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to delete the chamber: "${title.toUpperCase()}"?`)) {
            return;
        }

        try {
            await axiosInstance.delete(`/quizzes/${quizCode}`);
            setQuizzes(prev => prev.filter(q => q.quizCode !== quizCode));
            toast.success(`CHAMBER "${title.toUpperCase()}" REMOVED`);
        } catch (err) {
            console.error("Error deleting quiz:", err.response?.data || err.message);
            const errorMsg = err.response?.data?.message || "Failed to delete quiz.";
            toast.error(errorMsg.toUpperCase());
        }
    };

    const renderLoadingSkeletons = (count = 3) => (
        Array.from({ length: count }).map((_, index) => (
            <div key={index} className="bg-zinc-900 border-[3px] border-black p-5 flex flex-col justify-between h-64 shadow-[4px_4px_0px_0px_#000000] animate-pulse">
                <div className="flex gap-4">
                    <Skeleton className="w-14 h-14" />
                    <div className="flex-grow flex flex-col gap-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
                <Skeleton className="h-10 w-full" />
            </div>
        ))
    );

    const renderLeaderboardSkeletons = (count = 5) => (
        <ul className="space-y-3 animate-pulse">
            {Array.from({ length: count }).map((_, index) => (
                <li key={index} className="flex justify-between items-center gap-3">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-5 w-1/4" />
                </li>
            ))}
        </ul>
    );

    return (
        <div className="min-h-screen bg-zinc-950 text-white scanlines game-dot-grid p-4 md:p-8 font-sans animate-scanline-laser">
            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            <div className="container mx-auto max-w-6xl animate-slide-up">
                {/* Create Quiz CTA Card */}
                <Link to="/build" className="block mb-8 group">
                    <div className="bg-zinc-900 border-[3px] border-black p-6 shadow-[5px_5px_0_0_#ccff00] group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] group-hover:shadow-[7px_7px_0_0_#ccff00] transition-all flex justify-between items-center">
                        <div>
                            <div className="inline-block px-2 py-0.5 border-2 border-black bg-neon-pink text-white font-heading text-xs font-black uppercase tracking-wider mb-2">
                                MISSION BUILDER
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white font-heading">
                                CREATE YOUR OWN <span className="text-volt">CHAMBER</span>
                            </h2>
                            <p className="text-zinc-400 text-sm hidden md:block mt-1 font-body">
                                Construct unique testing files, add options, and compile a challenge link for players.
                            </p>
                        </div>
                        <div className="w-12 h-12 flex items-center justify-center border-2 border-black bg-volt text-black text-2xl shadow-[2px_2px_0_0_#000] group-hover:bg-volt-dark transition-colors shrink-0">
                            <i className="fa-solid fa-plus-circle text-md"></i>
                        </div>
                    </div>
                </Link>

                {/* Errors */}
                {error && (
                    <div className="mb-6 bg-neon-pink border-[3px] border-black text-white px-4 py-3 shadow-[4px_4px_0_0_#000] font-heading font-extrabold uppercase tracking-wide flex items-center gap-2" role="alert">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        <span>ERROR: {error}</span>
                    </div>
                )}

                {/* Dashboard Grid layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
                    {/* Quizzes List */}
                    <div className="lg:col-span-3">
                        <div className="flex items-center gap-2 mb-6">
                            <Badge variant="volt">CHAMBERS</Badge>
                            <h2 className="text-xl font-black uppercase text-white font-heading tracking-wide">
                                ACTIVE QUEUES
                            </h2>
                        </div>

                        {loadingQuizzes ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {renderLoadingSkeletons(3)}
                            </div>
                        ) : quizzes.length === 0 && !error ? (
                            <div className="text-center py-12 px-6 border-[3px] border-black bg-zinc-900 shadow-[4px_4px_0_0_#000]">
                                <i className="fa-solid fa-ghost fa-2x mb-3 text-zinc-500"></i>
                                <p className="text-zinc-400 mb-4 font-body">No quiz chambers detected in active range.</p>
                                <Link to="/build">
                                    <Button variant="cyan">INITIALIZE MAIN CORE</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {quizzes.map((quiz) => (
                                    <Card
                                        key={quiz._id}
                                        onClick={() => handlePlayQuiz(quiz.quizCode)}
                                        variant="black"
                                        className="flex flex-col justify-between min-h-[17rem] group cursor-pointer relative"
                                    >
                                        <div>
                                            {/* Top info */}
                                            <div className="flex gap-4 items-start mb-4 pr-8">
                                                <Avatar title={quiz.title} size="sm" className="shrink-0" />
                                                <div className="overflow-hidden">
                                                    <h3 className="font-heading font-black text-lg text-white group-hover:text-volt uppercase leading-snug truncate" title={quiz.title}>
                                                        {truncateText(quiz.title, 25)}
                                                    </h3>
                                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block mt-0.5">
                                                        CODE: {quiz.quizCode}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-zinc-400 text-xs md:text-sm font-medium leading-relaxed mb-4 h-10 overflow-hidden font-body" title={quiz.description || 'No description'}>
                                                {truncateText(quiz.description, 60) || <span className="italic">No description provided</span>}
                                            </p>
                                        </div>

                                        {/* Deletion button if ownership matches user */}
                                        {currentUser && currentUser._id === quiz.createdBy && (
                                            <button
                                                type="button"
                                                onClick={(e) => handleDeleteQuiz(e, quiz.quizCode, quiz.title)}
                                                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center border-2 border-black bg-zinc-950 text-neon-pink shadow-[2px_2px_0_0_#000] hover:bg-neon-pink hover:text-white transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_0_#000] z-20"
                                                title="Delete Custom Chamber"
                                            >
                                                <i className="fa-solid fa-trash-can text-xs" />
                                            </button>
                                        )}

                                        <div className="flex justify-between items-center pt-3 border-t-2 border-black/20 mt-auto">
                                            <Badge variant="cyan">
                                                {quiz.questionCount} Qs • {quiz.totalPoints} PTS
                                            </Badge>
                                            <span className="text-volt flex items-center font-heading font-extrabold text-xs tracking-wider uppercase group-hover:underline">
                                                ENGAGE <i className="fa-solid fa-chevron-right ml-1 text-[10px]" />
                                            </span>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right column Sidebar Leaderboard */}
                    <div className="lg:col-span-1">
                        <div className="lg:sticky lg:top-24">
                            <div className="flex items-center gap-2 mb-6">
                                <Badge variant="pink">RANKS</Badge>
                                <h2 className="text-xl font-black uppercase text-white font-heading tracking-wide">
                                    ELITE CORE
                                </h2>
                            </div>

                            <Card variant="accent" className="p-4">
                                <h3 className="font-heading font-black text-sm uppercase text-black bg-volt border-2 border-black px-2 py-0.5 w-fit rotate-[-1deg] mb-4">
                                    TOP SCORERS
                                </h3>

                                {loadingLeaderboard ? (
                                    renderLeaderboardSkeletons(5)
                                ) : leaderboard.length === 0 ? (
                                    <div className="text-center py-5 text-zinc-500 text-xs font-mono select-none">
                                        NO LOGS FOUND.
                                    </div>
                                ) : (
                                    <ul className="flex flex-col gap-3.5">
                                        {leaderboard.map((user, index) => (
                                            <li
                                                key={user._id || index}
                                                className="flex justify-between items-center text-sm font-mono border-b-2 border-zinc-800 pb-2 last:border-b-0 last:pb-0"
                                            >
                                                <span className="text-zinc-200 truncate pr-2 flex items-center font-body font-bold">
                                                    <span className={`font-black mr-2 font-heading ${index < 3 ? 'text-neon-pink' : 'text-zinc-500'}`}>
                                                        {index + 1}.
                                                    </span>
                                                    {user.username}
                                                </span>
                                                <Badge variant={index < 3 ? 'volt' : 'zinc'} className="font-mono text-xs scale-90">
                                                    {user.totalPoints} PTS
                                                </Badge>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <div className="mt-5 pt-3 border-t-2 border-black flex justify-center">
                                    <Link
                                        to="/leaderboard"
                                        className="text-xs text-zinc-400 hover:text-white uppercase font-black tracking-wider transition-colors duration-100 flex items-center font-heading"
                                    >
                                        FULL LEADERBOARD <i className="fa-solid fa-arrow-right-long ml-1.5" />
                                    </Link>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;