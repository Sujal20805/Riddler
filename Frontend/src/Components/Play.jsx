import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';

const Play = () => {
    const { quizCode } = useParams();
    const navigate = useNavigate();

    // State variables
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [currentSelection, setCurrentSelection] = useState(null);

    // Timer state (30 seconds per question)
    const [timeLeft, setTimeLeft] = useState(30);

    const [quizFinished, setQuizFinished] = useState(false);
    const [finalResult, setFinalResult] = useState(null);
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
            setQuizFinished(false);
            setFinalResult(null);
            setCurrentQuestionIndex(0);
            setCurrentSelection(null);
            setTimeLeft(30);

            try {
                const response = await axiosInstance.get(`/quizzes/${quizCode}`);
                if (!response.data || !response.data.questions || response.data.questions.length === 0) {
                    throw new Error("Invalid quiz data received.");
                }
                setQuiz(response.data);
                setQuestions(response.data.questions);
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
            setError("No quiz code specified.");
            setLoading(false);
        }
    }, [quizCode, navigate]);

    // Timer countdown hook
    useEffect(() => {
        if (loading || quizFinished || isSubmitting || !quiz) return;

        if (timeLeft === 0) {
            // Auto advance or submit when time runs out
            handleNextOrFinish();
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft, loading, quizFinished, isSubmitting, quiz]);

    // Reset timer on question change
    useEffect(() => {
        setTimeLeft(30);
    }, [currentQuestionIndex]);

    // Handle Option Selection
    const handleOptionSelect = (index) => {
        if (quizFinished || isSubmitting) return;

        setCurrentSelection(index);

        const updatedAnswers = [...selectedAnswers];
        updatedAnswers[currentQuestionIndex] = index;
        setSelectedAnswers(updatedAnswers);
    };

    // Handle Next or Finish
    const handleNextOrFinish = async () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setCurrentSelection(selectedAnswers[currentQuestionIndex + 1]);
        } else {
            setIsSubmitting(true);
            setError(null);
            try {
                console.log("Submitting answers:", selectedAnswers);
                const response = await axiosInstance.post(`/quizzes/${quizCode}/submit`, {
                    answers: selectedAnswers,
                });

                setFinalResult(response.data);
                setQuizFinished(true);

            } catch (err) {
                console.error("Error submitting quiz:", err.response?.data || err.message);
                if (err.response?.status === 401) {
                    localStorage.removeItem('quizAppToken');
                    localStorage.removeItem('quizAppUser');
                    navigate('/login');
                    return;
                }
                setError(err.response?.data?.message || "Failed to compile score results.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
    const currentQuestion = questions ? questions[currentQuestionIndex] : null;

    // Loading Screen
    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 scanlines game-dot-grid flex items-center justify-center p-4">
                <div className="font-heading font-black text-xl text-volt animate-pulse tracking-widest uppercase">
                    INITIALIZING SIMULATION...
                </div>
            </div>
        );
    }

    // Error Screen
    if (error && !quiz) {
        return (
            <div className="min-h-screen bg-zinc-950 scanlines game-dot-grid flex items-center justify-center p-4">
                <div className="border-[3px] border-black bg-neon-pink text-white p-6 shadow-[5px_5px_0_0_#000] max-w-md w-full text-center">
                    <i className="fa-solid fa-triangle-exclamation text-2xl mb-3"></i>
                    <h2 className="font-heading font-black text-lg uppercase mb-2">INTERFACE ERROR</h2>
                    <p className="font-body text-xs mb-6 text-zinc-200">{error}</p>
                    <Link to="/home" className="inline-block">
                        <Button variant="black">DISENGAGE HUD</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (!quiz || !currentQuestion) {
        return (
            <div className="min-h-screen bg-zinc-950 scanlines game-dot-grid flex items-center justify-center p-4">
                <p className="text-zinc-500 font-mono text-sm uppercase">Simulated Chamber unavailable</p>
            </div>
        );
    }

    // Quiz Finished / Score screen
    if (quizFinished && finalResult) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white scanlines game-dot-grid py-12 px-4 flex items-center justify-center">
                <Card variant="volt" className="max-w-md w-full text-center p-6 md:p-8 animate-pop-bounce">
                    <div className="w-16 h-16 flex items-center justify-center bg-volt border-2 border-black rotate-[-6deg] mx-auto mb-6 shadow-[3px_3px_0_0_#000]">
                        <i className="fa-solid fa-trophy text-black text-2xl"></i>
                    </div>

                    <Badge variant="cyan" className="mb-4">EVALUATION CONCLUDED</Badge>

                    <h2 className="text-3xl font-black uppercase text-white font-heading tracking-wide mb-6">
                        MISSION REPORT
                    </h2>

                    <div className="bg-zinc-950 border-[3px] border-black p-4 mb-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block mb-1">FINAL SCORE</span>
                        <span className="font-heading font-black text-4xl block">
                            <span className="text-volt">{finalResult.score}</span>
                            <span className="text-zinc-500 text-xl font-normal"> / {finalResult.maxScore}</span>
                        </span>
                    </div>

                    <div className="bg-zinc-950 border-[3px] border-black p-4 mb-8 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex justify-between items-center px-6">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block">DOSSIER TOTAL:</span>
                        <span className="font-heading font-black text-base text-neon-pink">
                            {finalResult.updatedTotalPoints} PTS
                        </span>
                    </div>

                    {error && (
                        <p className="text-neon-pink text-xs font-mono font-bold uppercase mb-4">
                            COMPILE ERROR: {error}
                        </p>
                    )}

                    <Button
                        onClick={() => navigate('/home')}
                        variant="pink"
                        className="w-full text-sm font-black"
                    >
                        DISENGAGE CHAMBERS
                    </Button>
                </Card>
            </div>
        );
    }

    // Active playing view
    return (
        <div className="min-h-screen bg-zinc-950 text-white scanlines game-dot-grid py-8 px-4 flex flex-col justify-center items-center font-sans animate-scanline-laser">
            <div className="w-full max-w-2xl animate-slide-up">

                {/* HUD Stats bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-zinc-900 border-[3px] border-black p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-2">
                        <Badge variant="cyan">HUD TYPE: {quizCode}</Badge>
                        <span className="text-xs text-zinc-400 font-bold uppercase truncate max-w-[120px] sm:max-w-xs" title={quiz.title}>
                            {quiz.title}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Badge variant="voltage" className="bg-zinc-950 border-black flex gap-1.5 items-center select-none font-mono">
                            <i className="fa-solid fa-clock text-neon-pink animate-pulse"></i>
                            <span className={timeLeft <= 10 ? 'text-neon-pink font-black animate-pulse' : 'text-zinc-300'}>
                                {timeLeft}S
                            </span>
                        </Badge>

                        <Badge variant="volt">
                            Q: {currentQuestionIndex + 1}/{questions.length}
                        </Badge>
                    </div>
                </div>

                {/* Progress HUD bar */}
                <div className="w-full bg-zinc-900 border-[3px] border-black h-5 mb-8 relative select-none">
                    <div
                        className="h-full bg-volt border-r-2 border-black transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] text-zinc-950 font-black tracking-widest font-heading select-none bg-volt px-1.5 border border-black/40">
                            PROGRESS INDEX: {Math.round(progress)}%
                        </span>
                    </div>
                </div>

                {/* Question Panel */}
                <Card variant="black" className="mb-6">
                    <div className="flex justify-between items-start mb-4 border-b-2 border-zinc-800 pb-3">
                        <span className="font-heading font-black text-sm uppercase text-volt">
                            QUEST UNIT {currentQuestionIndex + 1}
                        </span>
                        <Badge variant="pink">{currentQuestion.points} PTS</Badge>
                    </div>

                    {currentQuestion.image && (
                        <div className="border-[3px] border-black p-2 bg-zinc-950 mb-6 flex justify-center shadow-[3px_3px_0_0_#000]">
                            <img
                                src={currentQuestion.image}
                                alt="Tactical visualization"
                                className="max-h-56 w-auto object-contain border border-zinc-850"
                            />
                        </div>
                    )}

                    <h2 className="text-xl md:text-2xl font-heading font-black uppercase tracking-tight text-white mb-8 border-l-[4px] border-volt pl-3">
                        {currentQuestion.questionText}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option, index) => {
                            const letter = String.fromCharCode(65 + index);
                            const isSelected = currentSelection === index;

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    className={`w-full p-4 border-[3px] text-left transition-all duration-150 flex items-center gap-3 active:translate-x-[2px] active:translate-y-[2px] ${isSelected
                                        ? 'border-volt bg-volt text-black shadow-[2px_2px_0_0_#000]'
                                        : 'border-black bg-zinc-950 text-white hover:bg-zinc-900 shadow-[4px_4px_0_0_rgba(0,0,0,1)]'
                                        }`}
                                    onClick={() => handleOptionSelect(index)}
                                    disabled={isSubmitting}
                                >
                                    <span className={`w-6 h-6 border-2 flex items-center justify-center text-xs font-heading font-black shrink-0 ${isSelected
                                        ? 'bg-zinc-950 border-zinc-900 text-white'
                                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                                        }`}>
                                        {letter}
                                    </span>
                                    <span className="font-body font-bold text-sm leading-snug">
                                        {option}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </Card>

                {error && (
                    <p className="text-neon-pink text-xs font-mono font-bold uppercase text-center mb-4">
                        COMPILE REPORT: {error}
                    </p>
                )}

                {/* Submit HUD Action */}
                <Button
                    onClick={handleNextOrFinish}
                    className="w-full text-base font-black"
                    variant={currentSelection === null || isSubmitting ? "ghost" : "volt"}
                    disabled={currentSelection === null || isSubmitting}
                    loading={isSubmitting}
                >
                    {currentQuestionIndex < questions.length - 1 ? (
                        <>ADVANCE SIMULATOR <i className="fa-solid fa-arrow-right ml-2"></i></>
                    ) : (
                        <>SUBMIT SCORE MATRIX <i className="fa-solid fa-check-circle ml-2"></i></>
                    )}
                </Button>

            </div>
        </div>
    );
};

export default Play;