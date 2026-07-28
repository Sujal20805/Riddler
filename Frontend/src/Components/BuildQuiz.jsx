import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from "../api/axiosInstance";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';
import FormField from './ui/FormField';

const validateForm = (question) => {
    const errors = {};
    if (!question) return errors;

    if (!question.questionText?.trim()) {
        errors.questionText = 'Question text cannot be empty.';
    }

    if (question.image && typeof question.image !== 'string') {
        errors.image = 'Invalid image data.';
    }

    if (!Array.isArray(question.options) || question.options.length !== 4 || question.options.some(option => typeof option !== 'string' || !option.trim())) {
        errors.options = 'All 4 options must be filled.';
    }

    const correctIndex = question.correctAnswerIndex;
    if (correctIndex === null || correctIndex === undefined || isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
        errors.correctAnswerIndex = 'Please select a valid correct answer.';
    } else if (!question.options[correctIndex]?.trim()) {
        errors.correctAnswerIndex = 'The selected correct option text cannot be empty.';
    }

    const pointsValue = question.points;
    const pointsNum = Number(pointsValue);

    if (pointsValue === null || pointsValue === '' || isNaN(pointsNum) || pointsNum <= 0 || pointsNum % 10 !== 0) {
        errors.points = 'Points must be a positive multiple of 10.';
    }

    return errors;
};

const BuildQuiz = () => {
    const [quizTitle, setQuizTitle] = useState('');
    const [quizDescription, setQuizDescription] = useState('');
    const [quizCode, setQuizCode] = useState('');
    const [questions, setQuestions] = useState([]);
    const [selectedQuestionId, setSelectedQuestionId] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [quizMetaErrors, setQuizMetaErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    const selectedQuestion = useMemo(() =>
        questions.find(q => q.id === selectedQuestionId),
        [questions, selectedQuestionId]
    );

    const getCurrentErrors = useCallback(() => {
        return validateForm(selectedQuestion);
    }, [selectedQuestion]);

    const hasUnsavedChanges = useMemo(() => {
        return selectedQuestionId !== null && Object.keys(getCurrentErrors()).length > 0;
    }, [selectedQuestionId, getCurrentErrors]);

    useEffect(() => {
        setFormErrors(getCurrentErrors());
    }, [selectedQuestionId, questions, getCurrentErrors]);

    // Auth Guard check
    useEffect(() => {
        if (!localStorage.getItem('quizAppToken')) {
            navigate('/login');
        }
    }, [navigate]);

    const handleQuizMetaChange = (field, value) => {
        if (field === 'title') setQuizTitle(value);
        if (field === 'description') setQuizDescription(value);
        if (field === 'code') setQuizCode(value.toUpperCase());

        if (quizMetaErrors[field]) {
            setQuizMetaErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const checkCurrentQuestionValidity = () => {
        if (selectedQuestionId) {
            const errors = validateForm(selectedQuestion);
            setFormErrors(errors);
            if (Object.keys(errors).length > 0) {
                toast.error("The currently selected question has errors. Resolve them before moving on.");
                return false;
            }
        }
        return true;
    };

    const addQuestion = () => {
        if (!checkCurrentQuestionValidity()) {
            return;
        }

        const newQuestion = {
            id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            questionText: '',
            image: null,
            options: ['', '', '', ''],
            correctAnswerIndex: null,
            points: 10,
        };
        setQuestions([...questions, newQuestion]);
        setSelectedQuestionId(newQuestion.id);
        setFormErrors({});
        toast.info("NEW QUESTION ADDED TO DECK");
    };

    const updateQuestion = (id, field, value) => {
        setQuestions(prevQuestions =>
            prevQuestions.map(q =>
                q.id === id ? { ...q, [field]: value } : q
            )
        );
    };

    const updateOption = (questionId, optionIndex, value) => {
        setQuestions(prevQuestions =>
            prevQuestions.map(q =>
                q.id === questionId
                    ? {
                        ...q,
                        options: q.options.map((opt, index) =>
                            index === optionIndex ? value : opt
                        ),
                    }
                    : q
            )
        );
    };

    const deleteQuestion = (idToDelete) => {
        const questionToDelete = questions.find(q => q.id === idToDelete);
        const questionText = questionToDelete?.questionText || 'this question';

        if (!window.confirm(`Are you sure you want to delete question: "${truncateText(questionText, 35)}"?`)) {
            return;
        }

        setQuestions(prev => prev.filter(q => q.id !== idToDelete));

        if (selectedQuestionId === idToDelete) {
            setSelectedQuestionId(null);
            setFormErrors({});
        }
        toast.warning("QUESTION REMOVED");
    };

    const handleImageChange = (questionId, e) => {
        const file = e.target.files[0];
        const MAX_SIZE_MB = 5;
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error("Please select a valid image file.");
            e.target.value = null;
            return;
        }

        if (file.size > MAX_SIZE_BYTES) {
            toast.error(`Image is too large (Max ${MAX_SIZE_MB}MB).`);
            e.target.value = null;
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            updateQuestion(questionId, 'image', reader.result);
            setFormErrors(prev => {
                const { image, ...rest } = prev;
                return rest;
            });
            toast.success("IMAGE LOADED");
        };
        reader.onerror = () => {
            toast.error("Failed to read image file.");
            updateQuestion(questionId, 'image', null);
            e.target.value = null;
        };
        reader.readAsDataURL(file);
    };

    const handleQuestionClick = (id) => {
        if (selectedQuestionId !== null && selectedQuestionId !== id) {
            if (!checkCurrentQuestionValidity()) {
                return;
            }
        }
        setSelectedQuestionId(id);
    };

    const validateQuizMeta = () => {
        const errors = {};
        if (!quizTitle.trim()) {
            errors.title = "Quiz title is required.";
        }
        if (quizCode.trim() && !/^[A-Z0-9_.-]+$/i.test(quizCode.trim())) {
            errors.code = "Custom codes contain only characters, numbers, and basic marks (-_.).";
        }
        setQuizMetaErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveQuiz = async () => {
        if (!checkCurrentQuestionValidity()) return;

        if (!validateQuizMeta()) {
            toast.error("Please resolve Quiz Detail errors.");
            return;
        }

        if (questions.length === 0) {
            toast.error("Add at least one question before saving.");
            return;
        }

        let firstInvalidQuestionId = null;
        let firstInvalidQuestionIndex = -1;
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            const errors = validateForm(question);
            if (Object.keys(errors).length > 0) {
                firstInvalidQuestionId = question.id;
                firstInvalidQuestionIndex = i;
                break;
            }
        }

        if (firstInvalidQuestionId) {
            const invalidQuestion = questions[firstInvalidQuestionIndex];
            setSelectedQuestionId(firstInvalidQuestionId);
            setFormErrors(validateForm(invalidQuestion));
            toast.error(`Question ${firstInvalidQuestionIndex + 1} has validation errors.`);
            return;
        }

        setIsSaving(true);
        setQuizMetaErrors({});

        const quizDataForBackend = {
            quizCode: quizCode.trim() || undefined,
            title: quizTitle.trim(),
            description: quizDescription.trim(),
            questions: questions.map(q => ({
                questionText: q.questionText.trim(),
                image: q.image,
                options: q.options.map(opt => opt.trim()),
                correctOptionIndex: q.correctAnswerIndex,
                points: Number(q.points),
            })),
        };

        try {
            const response = await axiosInstance.post('/quizzes', quizDataForBackend);
            const resultData = response.data;

            toast.success(`CHAMBER "${resultData.title.toUpperCase()}" ACTIVE! CODE: ${resultData.quizCode}`);

            // Complete reset
            setQuizTitle('');
            setQuizDescription('');
            setQuizCode('');
            setQuestions([]);
            setSelectedQuestionId(null);
            setFormErrors({});
            setQuizMetaErrors({});

            setTimeout(() => {
                navigate('/home');
            }, 2000);

        } catch (error) {
            console.error("Error saving quiz:", error.response?.data || error.message);
            const errorData = error.response?.data;
            const statusCode = error.response?.status;

            if (statusCode === 401) {
                toast.error("Session expired. Authenticating...");
                localStorage.removeItem('quizAppToken');
                localStorage.removeItem('quizAppUser');
                navigate('/login');
            } else if (statusCode === 409 && errorData?.message?.includes('Quiz code')) {
                setQuizMetaErrors(prev => ({ ...prev, code: errorData.message }));
                toast.error(errorData.message.toUpperCase());
            } else if (statusCode === 400 && errorData?.errors) {
                toast.error(`Validation: ${errorData.errors.join(', ')}`);
            } else {
                toast.error(errorData?.message || 'Chamber compilation error.');
            }
        } finally {
            setIsSaving(false);
        }
    };

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
                {/* Back Link */}
                <div className="mb-6">
                    <Link
                        to="/home"
                        className="inline-flex items-center font-heading font-black text-xs uppercase tracking-wider text-volt hover:underline"
                    >
                        <i className="fa-solid fa-arrow-left-long mr-2" /> DISENGAGE BUILDER
                    </Link>
                </div>

                <Card variant="volt" className="mb-8">
                    <div className="border-b-2 border-black/20 pb-4 mb-6">
                        <Badge variant="pink" className="mb-2">COMPILATION DECK</Badge>
                        <h1 className="text-3xl font-black uppercase text-white font-heading tracking-wide">
                            CHAMBER BUILD MODE
                        </h1>
                        <p className="text-zinc-400 text-xs mt-1 font-body">
                            Initialize a set of quiz arrays, load interactive assets, and finalize room codes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <FormField
                                label="Quiz Title"
                                id="quizTitle"
                                placeholder="e.g. Synth-Cyber Tactics"
                                value={quizTitle}
                                onChange={(e) => handleQuizMetaChange('title', e.target.value)}
                                error={quizMetaErrors.title}
                                disabled={isSaving}
                            />
                        </div>
                        <div>
                            <FormField
                                label="Custom Access Code"
                                id="quizCode"
                                placeholder="AUTO-GEN IF BLANK"
                                value={quizCode}
                                onChange={(e) => handleQuizMetaChange('code', e.target.value)}
                                error={quizMetaErrors.code}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="md:col-span-3">
                            <div className="flex flex-col gap-1.5 w-full">
                                <label className="text-sm font-extrabold uppercase tracking-wider text-zinc-300 font-heading">
                                    Chamber Details
                                </label>
                                <textarea
                                    id="quizDescription"
                                    rows="2"
                                    placeholder="Enter details about this play queue..."
                                    className="w-full px-4 py-3 bg-zinc-900 border-[3px] border-black text-white placeholder-zinc-500 rounded-none focus:outline-none focus:border-volt focus:ring-4 focus:ring-volt/20 transition-all duration-150 font-medium resize-none"
                                    value={quizDescription}
                                    onChange={(e) => handleQuizMetaChange('description', e.target.value)}
                                    disabled={isSaving}
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Builder Workdesk */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Deck List (Column 1) */}
                    <div className="lg:col-span-1 flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-3">
                            <div className="flex items-center gap-2">
                                <Badge variant="cyan">DECK</Badge>
                                <h2 className="text-md font-black uppercase text-white font-heading tracking-wide">
                                    QUESTIONS ({questions.length})
                                </h2>
                            </div>
                            <Button
                                variant={hasUnsavedChanges ? "ghost" : "volt"}
                                onClick={addQuestion}
                                disabled={hasUnsavedChanges}
                                className="py-1 px-3 text-xs"
                            >
                                <i className="fa-solid fa-plus mr-1"></i> ADD
                            </Button>
                        </div>

                        <div className="flex-grow space-y-3 max-h-[50vh] overflow-y-auto pr-2 pb-2">
                            {questions.length === 0 && (
                                <div className="text-center py-10 border-2 border-dashed border-zinc-800 bg-zinc-900/50 text-zinc-500 text-xs font-mono">
                                    DECK EMPTY. CLICK ADD QUESTION to START.
                                </div>
                            )}
                            {questions.map((question, index) => {
                                const isSelected = selectedQuestionId === question.id;
                                const questionErrors = validateForm(question);
                                const hasError = Object.keys(questionErrors).length > 0;

                                return (
                                    <div
                                        key={question.id}
                                        className={`relative p-3 border-[3px] cursor-pointer transition-all flex items-center justify-between gap-3 ${isSelected
                                            ? 'border-volt bg-volt/5 shadow-[4px_4px_0_0_#ccff00]'
                                            : hasError
                                                ? 'border-neon-pink bg-neon-pink/5 shadow-[4px_4px_0_0_#ec4899]'
                                                : 'border-black bg-zinc-905 hover:bg-zinc-900 shadow-[4px_4px_0_0_rgba(0,0,0,1)]'
                                            }`}
                                        onClick={() => handleQuestionClick(question.id)}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden flex-grow select-none">
                                            {question.image ? (
                                                <img
                                                    src={question.image}
                                                    alt=""
                                                    className="w-8 h-8 object-cover border border-black bg-zinc-800 shrink-0"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-600 text-xs shrink-0 font-mono">
                                                    IMG
                                                </div>
                                            )}

                                            <div className="overflow-hidden">
                                                <span className="font-heading font-black text-xs block text-white uppercase truncate">
                                                    Q{index + 1}: {question.questionText || <span className="italic text-zinc-500 font-sans font-normal">Untitled Question</span>}
                                                </span>
                                                <span className="text-[9px] text-zinc-500 font-mono font-bold block">
                                                    VALUE: {question.points} PTS
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className="w-7 h-7 flex items-center justify-center border-2 border-black bg-zinc-900 text-neon-pink shadow-[1px_1px_0_0_#000] hover:bg-neon-pink hover:text-white shrink-0 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteQuestion(question.id);
                                            }}
                                        >
                                            <i className="fa-solid fa-trash-can text-xs"></i>
                                        </button>

                                        {hasError && !isSelected && (
                                            <span className="absolute top-[-8px] left-[-8px] text-[10px] w-5 h-5 flex items-center justify-center bg-neon-pink text-white rounded-full border border-black font-mono font-black animate-bounce shadow">
                                                !
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-4 border-t-2 border-zinc-900">
                            <Button
                                variant={isSaving || hasUnsavedChanges || questions.length === 0 ? "ghost" : "pink"}
                                onClick={handleSaveQuiz}
                                disabled={isSaving || hasUnsavedChanges || questions.length === 0}
                                className="w-full text-base font-black tracking-wider"
                            >
                                {isSaving ? "SAVING CHAMBER..." : "COMPILE & PUBLISH"}
                            </Button>
                            {hasUnsavedChanges && (
                                <p className="text-neon-pink text-[10px] uppercase font-mono font-bold mt-2 text-center">
                                    * COMPILER BLOCKED: RESOLVE ERRORS FIRST
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Question Editor Pane (Column 2 & 3) */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-3 mb-4">
                            <div className="flex items-center gap-2">
                                <Badge variant="pink">COMPILER</Badge>
                                <h2 className="text-md font-black uppercase text-white font-heading tracking-wide">
                                    {selectedQuestion
                                        ? `EDITING UNIT #${questions.findIndex(q => q.id === selectedQuestionId) + 1}`
                                        : 'EDITOR TERMINAL'}
                                </h2>
                            </div>
                        </div>

                        {selectedQuestion ? (
                            <QuestionCard
                                key={selectedQuestion.id}
                                question={selectedQuestion}
                                updateQuestion={updateQuestion}
                                updateOption={updateOption}
                                handleImageChange={handleImageChange}
                                formErrors={formErrors}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 border-[3px] border-dashed border-zinc-800 bg-zinc-900/10 text-center">
                                <i className="fa-solid fa-terminal fa-2x text-zinc-700 mb-4 animate-pulse"></i>
                                <p className="text-zinc-500 font-mono text-xs uppercase tracking-wider">
                                    {questions.length > 0
                                        ? "Select a quest unit on the left to initialize editor inputs."
                                        : 'Click "ADD" above to construct your initial quest unit.'}
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

const QuestionCard = React.memo(({ question, updateQuestion, updateOption, handleImageChange, formErrors = {} }) => {
    return (
        <Card variant="accent" className="flex flex-col gap-5 p-5 md:p-6 bg-zinc-900 border-[3px] border-black">

            {/* Question Text */}
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-extrabold uppercase tracking-wider text-zinc-300 font-heading">
                    Question Descriptor <span className="text-volt">*</span>
                </label>
                <textarea
                    id={`qtext-${question.id}`}
                    rows="3"
                    placeholder="What is the challenge prompt?"
                    className={`w-full px-4 py-3 bg-zinc-950 border-[3px] text-white placeholder-zinc-650 rounded-none focus:outline-none transition-all duration-150 font-medium resize-none ${formErrors.questionText ? 'border-neon-pink focus:ring-4 focus:ring-neon-pink/20' : 'border-black focus:border-volt focus:ring-4 focus:ring-volt/20'
                        }`}
                    value={question.questionText}
                    onChange={(e) => updateQuestion(question.id, 'questionText', e.target.value)}
                />
                {formErrors.questionText && (
                    <span className="text-neon-pink text-xs font-mono font-bold uppercase mt-1">
                        {formErrors.questionText}
                    </span>
                )}
            </div>

            {/* Image Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-extrabold uppercase tracking-wider text-zinc-300 font-heading">
                        Tactical Image View (Optional)
                    </label>
                    <div className="w-full flex items-center justify-between border-[3px] border-black bg-zinc-950 px-3 py-2">
                        <span className="text-zinc-500 text-xs font-mono font-bold uppercase truncate pr-4">
                            {question.image ? "LOADED: base64" : "NO IMAGE LOADED"}
                        </span>
                        <label className="cursor-pointer font-heading font-black text-[10px] uppercase border-[2px] border-black bg-volt text-black py-1 px-3 shadow-[1px_1px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shrink-0 text-center select-none">
                            UPLOAD
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageChange(question.id, e)}
                            />
                        </label>
                    </div>
                    {formErrors.image && (
                        <span className="text-neon-pink text-xs font-mono font-bold uppercase mt-1">
                            {formErrors.image}
                        </span>
                    )}
                </div>

                {/* Thumbnail Preview Area */}
                {question.image && (
                    <div className="border-[3px] border-black bg-zinc-950 p-2 relative group w-fit">
                        <img
                            src={question.image}
                            alt="Question visualization"
                            className="max-h-24 object-contain"
                        />
                        <button
                            type="button"
                            className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center border-2 border-black bg-neon-pink text-white rounded-none shadow-[1px_1px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                            onClick={() => updateQuestion(question.id, 'image', null)}
                        >
                            <i className="fa-solid fa-xmark text-[10px]"></i>
                        </button>
                    </div>
                )}
            </div>

            {/* Answer Elements / Choices */}
            <div className="flex flex-col gap-3">
                <label className="text-sm font-extrabold uppercase tracking-wider text-zinc-300 font-heading">
                    Answer Options (All 4 Required) <span className="text-volt">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {question.options.map((option, index) => {
                        const letter = String.fromCharCode(65 + index);
                        return (
                            <div key={index} className="flex items-center border-[3px] border-black bg-zinc-950 px-3 py-1.5 focus-within:border-volt transition-colors">
                                <span className="font-heading font-black text-xs text-zinc-500 mr-2 select-none">
                                    {letter}.
                                </span>
                                <input
                                    type="text"
                                    placeholder={`Enter Option ${letter}`}
                                    className="flex-1 bg-transparent border-0 text-white placeholder-zinc-650 text-xs md:text-sm font-extrabold focus:ring-0 focus:outline-none"
                                    value={option}
                                    onChange={(e) => updateOption(question.id, index, e.target.value)}
                                />
                            </div>
                        );
                    })}
                </div>
                {formErrors.options && (
                    <span className="text-neon-pink text-xs font-mono font-bold uppercase">
                        {formErrors.options}
                    </span>
                )}
            </div>

            {/* Correct Option index & Point multipliers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t-2 border-black/20">

                {/* Correct Select */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-extrabold uppercase tracking-wider text-zinc-300 font-heading">
                        Target Correct Index <span className="text-volt">*</span>
                    </label>
                    <select
                        className={`w-full px-4 py-2.5 bg-zinc-950 border-[3px] text-white rounded-none focus:outline-none transition-all duration-150 font-heading font-black uppercase text-xs tracking-wider cursor-pointer ${formErrors.correctAnswerIndex ? 'border-neon-pink' : 'border-black focus:border-volt'
                            }`}
                        value={question.correctAnswerIndex ?? ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            updateQuestion(question.id, 'correctAnswerIndex', val === '' ? null : parseInt(val, 10));
                        }}
                    >
                        <option value="" disabled>-- SELECT CORRECT VALUE --</option>
                        {question.options.map((option, index) => (
                            <option
                                key={index}
                                value={index}
                                disabled={!option?.trim()}
                                className="bg-zinc-900 text-white"
                            >
                                {String.fromCharCode(65 + index)}. {truncateText(option?.trim(), 25) || `(ENTER OPTION ${String.fromCharCode(65 + index)} TEXT)`}
                            </option>
                        ))}
                    </select>
                    {formErrors.correctAnswerIndex && (
                        <span className="text-neon-pink text-xs font-mono font-bold uppercase">
                            {formErrors.correctAnswerIndex}
                        </span>
                    )}
                </div>

                {/* Question Point count */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-extrabold uppercase tracking-wider text-zinc-300 font-heading">
                        Point Reward Multiplier (Multiples of 10) <span className="text-volt">*</span>
                    </label>
                    <input
                        type="number"
                        step="10"
                        min="10"
                        className={`w-full px-4 py-2.5 bg-zinc-950 border-[3px] text-white rounded-none focus:outline-none transition-all duration-150 font-mono font-bold text-sm ${formErrors.points ? 'border-neon-pink' : 'border-black focus:border-volt'
                            }`}
                        placeholder="10, 20, 30..."
                        value={question.points ?? ''}
                        onChange={(e) => {
                            const rawValue = e.target.value;
                            if (rawValue === '') {
                                updateQuestion(question.id, 'points', '');
                            } else {
                                const numValue = parseInt(rawValue, 10);
                                updateQuestion(question.id, 'points', isNaN(numValue) ? rawValue : numValue);
                            }
                        }}
                        onBlur={(e) => {
                            const rawValue = e.target.value;
                            const numValue = parseInt(rawValue, 10);

                            if (rawValue.trim() === '' || isNaN(numValue)) {
                                updateQuestion(question.id, 'points', rawValue.trim() === '' ? null : rawValue);
                            } else if (numValue >= 10 && numValue % 10 === 0) {
                                updateQuestion(question.id, 'points', numValue);
                            } else {
                                updateQuestion(question.id, 'points', rawValue);
                            }
                        }}
                    />
                    {formErrors.points && (
                        <span className="text-neon-pink text-xs font-mono font-bold uppercase mt-1">
                            {formErrors.points}
                        </span>
                    )}
                </div>

            </div>

        </Card>
    );
});

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

export default BuildQuiz;