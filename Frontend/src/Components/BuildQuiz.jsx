// src/Components/BuildQuiz.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axiosInstance from "../api/axiosInstance"; // Import instance
import { useNavigate } from 'react-router-dom'; // For redirect on unauthorized

// Helper function for validation
const validateForm = (question) => {
    const errors = {};
    if (!question) return errors; // Should not happen if called correctly

    // Question Text
    if (!question.questionText?.trim()) {
        errors.questionText = 'Question text cannot be empty.';
    }

    // Image (basic check, actual validation in handleImageChange)
    if (question.image && typeof question.image !== 'string') {
         errors.image = 'Invalid image data.'; // Only if something goes wrong with Base64
    }

    // Options - Check if *all 4* are filled
    if (!Array.isArray(question.options) || question.options.length !== 4 || question.options.some(option => typeof option !== 'string' || !option.trim())) {
        errors.options = 'All 4 options must be filled.';
    }

    // Correct Answer Index - Allow 0, check against filled options
    const correctIndex = question.correctAnswerIndex;
    if (correctIndex === null || correctIndex === undefined || isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
        errors.correctAnswerIndex = 'Please select a valid correct answer.';
    } else if (!question.options[correctIndex]?.trim()) {
        // Also check if the selected correct option text is actually filled
         errors.correctAnswerIndex = 'The selected correct option text cannot be empty.';
    }

    // Points - Must be a positive multiple of 10
    const pointsValue = question.points; // Value could be string or number during input
    const pointsNum = Number(pointsValue); // Coerce to number for checks

    if (pointsValue === null || pointsValue === '' || isNaN(pointsNum) || pointsNum <= 0 || pointsNum % 10 !== 0) {
        errors.points = 'Points must be a positive number, multiple of 10 (e.g., 10, 20).';
    }

    return errors;
};

// --- Main Component ---
const BuildQuiz = () => {
    // --- State Variables ---
    const [quizTitle, setQuizTitle] = useState('');
    const [quizDescription, setQuizDescription] = useState('');
    const [quizCode, setQuizCode] = useState(''); // Optional custom code
    const [questions, setQuestions] = useState([]); // Array of question objects
    const [selectedQuestionId, setSelectedQuestionId] = useState(null); // ID of the question being edited
    const [formErrors, setFormErrors] = useState({}); // Errors for the *currently selected* question
    const [quizMetaErrors, setQuizMetaErrors] = useState({}); // Errors for title, code, description
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate(); // For navigation

    // Find the currently selected question object based on ID
    const selectedQuestion = useMemo(() =>
        questions.find(q => q.id === selectedQuestionId),
        [questions, selectedQuestionId]
    );

    // Memoized validation function for the selected question
    const getCurrentErrors = useCallback(() => {
        return validateForm(selectedQuestion);
    }, [selectedQuestion]);

    // Determine if the currently selected question has validation errors
    const hasUnsavedChanges = useMemo(() => {
        // Also consider meta fields changed but not saved? For now, just question errors.
        return selectedQuestionId !== null && Object.keys(getCurrentErrors()).length > 0;
    }, [selectedQuestionId, getCurrentErrors]);

    // Update formErrors state ONLY when the selected question changes or its content changes
    useEffect(() => {
        setFormErrors(getCurrentErrors());
    }, [selectedQuestionId, questions, getCurrentErrors]); // Re-run if selectedId changes or the content of the selected question within 'questions' modifies

    // --- Event Handlers ---

    // Handle changes in Quiz Title, Description, Code fields
    const handleQuizMetaChange = (field, value) => {
        if (field === 'title') setQuizTitle(value);
        if (field === 'description') setQuizDescription(value);
        if (field === 'code') setQuizCode(value.toUpperCase()); // Store code uppercase

        // Clear the specific meta error when the user types in the field
        if (quizMetaErrors[field]) {
             setQuizMetaErrors(prev => ({...prev, [field]: undefined}));
        }
    };

    // Checks validity of the *currently selected* question before proceeding (e.g., adding new, saving)
    const checkCurrentQuestionValidity = () => {
        if (selectedQuestionId) {
            const errors = validateForm(selectedQuestion);
            setFormErrors(errors); // Update UI to show current errors immediately
            if (Object.keys(errors).length > 0) {
                alert("The currently selected question has errors. Please fix them before proceeding.");
                return false; // Invalid
            }
        }
        return true; // Valid or no question currently selected
    };

    // Add a new blank question
    const addQuestion = () => {
        // Ensure the current question (if any) is valid before adding a new one
        if (!checkCurrentQuestionValidity()) {
            return;
        }

        const newQuestion = {
            // Use a more robust temporary ID (e.g., crypto.randomUUID() if browser supports)
            id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            questionText: '',
            image: null, // Base64 string or null
            options: ['', '', '', ''],
            correctAnswerIndex: null, // Match backend: correctOptionIndex
            points: 10, // Default points
        };
        setQuestions([...questions, newQuestion]);
        setSelectedQuestionId(newQuestion.id); // Automatically select the new question
        setFormErrors({}); // Clear errors for the new blank question
    };

    // Update a specific field of a question
    const updateQuestion = (id, field, value) => {
        setQuestions(prevQuestions =>
            prevQuestions.map(q =>
                q.id === id ? { ...q, [field]: value } : q
            )
        );
        // Validation errors will update via the useEffect hook watching 'questions'
    };

    // Update a specific option within a question
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
        // Validation errors will update via the useEffect hook
    };

    // Delete a question
    const deleteQuestion = (idToDelete) => {
        const questionToDelete = questions.find(q => q.id === idToDelete);
        const questionText = questionToDelete?.questionText || 'this question';

        // Confirm before deleting
        if (!window.confirm(`Are you sure you want to delete question: "${truncateText(questionText, 40)}"?`)) {
            return;
        }

        setQuestions(prev => prev.filter(q => q.id !== idToDelete));

        // If the deleted question was the currently selected one, deselect it
        if (selectedQuestionId === idToDelete) {
            setSelectedQuestionId(null);
            setFormErrors({}); // Clear errors from the editor panel
        }
    };

    // Handle image file selection, validation, and conversion to Base64
    const handleImageChange = (questionId, e) => {
        const file = e.target.files[0];
        const MAX_SIZE_MB = 5;
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

        if (!file) {
            // User cancelled file selection - do nothing, keep existing image/null
            return;
        }

        // Validate type
        if (!file.type.startsWith('image/')) {
            alert("Please select a valid image file (e.g., JPG, PNG, GIF, WEBP).");
            e.target.value = null; // Clear the file input
            return;
        }

        // Validate size
         if (file.size > MAX_SIZE_BYTES) {
             alert(`Image is too large (Max ${MAX_SIZE_MB}MB). Please choose a smaller file.`);
             e.target.value = null; // Clear the file input
             return;
         }

        // Read file as Base64
        const reader = new FileReader();
        reader.onloadend = () => {
            // Update question state with Base64 string
            updateQuestion(questionId, 'image', reader.result);
            // Clear potential image validation error after successful load (if it existed)
             setFormErrors(prev => {
                 const { image, ...rest } = prev; // Remove image error if present
                 return rest;
             });
        };
        reader.onerror = (error) => {
            console.error("Error reading image file:", error);
            alert("Error reading image file.");
            updateQuestion(questionId, 'image', null); // Clear image on error
            e.target.value = null;
        };
        reader.readAsDataURL(file);
    };


    // Handle clicking on a question in the list to select it for editing
    const handleQuestionClick = (id) => {
        // If trying to switch *away* from a question that has errors, prevent it and alert user
        if (selectedQuestionId !== null && selectedQuestionId !== id) {
             if (!checkCurrentQuestionValidity()) {
                 // Alert is shown by checkCurrentQuestionValidity()
                 return; // Stop switching
             }
        }
        // If clicking the same question again, or the current one is valid, allow selection change
        setSelectedQuestionId(id);
        // Errors for the newly selected question will be updated by the useEffect hook
    };

    // Validate Quiz Metadata (Title required, Code format if provided)
    const validateQuizMeta = () => {
        const errors = {};
        if (!quizTitle.trim()) {
            errors.title = "Quiz title is required.";
        }
        // Code is optional, but validate format if user enters something
        if (quizCode.trim() && !/^[A-Z0-9_.-]+$/i.test(quizCode.trim())) {
            errors.code = "Quiz code can only contain letters, numbers, hyphens (-), underscores (_), and periods (.).";
        }
        // Optional: Add length validation for code
        // if (quizCode.trim() && (quizCode.trim().length < 4 || quizCode.trim().length > 20)) {
        //     errors.code = "Quiz code must be between 4 and 20 characters.";
        // }
        setQuizMetaErrors(errors);
        return Object.keys(errors).length === 0; // Return true if no errors
    }

    // --- Save Quiz Logic ---
    const handleSaveQuiz = async () => {
        // 1. Check validity of the *currently selected* question (if any are selected)
        if (!checkCurrentQuestionValidity()) {
            return; // Alert already shown
        }

        // 2. Validate Quiz Metadata (Title required, Code format checked)
        if (!validateQuizMeta()) {
             alert("Please fix the errors in the Quiz Details section (e.g., Title is required, Code format).");
             // Optional: Focus the first field with an error
             const firstErrorField = Object.keys(quizMetaErrors)[0];
             if (firstErrorField) {
                 document.getElementById(`quiz${firstErrorField.charAt(0).toUpperCase() + firstErrorField.slice(1)}`)?.focus();
             }
             return;
        }

        // 3. Ensure there's at least one question added
        if (questions.length === 0) {
            alert("Please add at least one question to the quiz before saving.");
            return;
        }

        // 4. Validate *ALL* questions in the list before sending
        let firstInvalidQuestionId = null;
        let firstInvalidQuestionIndex = -1;
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            const errors = validateForm(question);
            if (Object.keys(errors).length > 0) {
                firstInvalidQuestionId = question.id;
                firstInvalidQuestionIndex = i;
                break; // Found the first invalid question
            }
        }

        // 5. If an invalid question is found, select it in the UI and show errors
        if (firstInvalidQuestionId) {
             const invalidQuestion = questions[firstInvalidQuestionIndex];
             setSelectedQuestionId(firstInvalidQuestionId); // Select the invalid question
             setFormErrors(validateForm(invalidQuestion)); // Ensure its errors are shown in the editor
             alert(`Question ${firstInvalidQuestionIndex + 1} ("${truncateText(invalidQuestion.questionText || 'Untitled', 30)}") has errors. Please fix them before saving.`);
             return; // Stop the save process
        }

        // --- All Validations Passed ---

        setIsSaving(true);
        setQuizMetaErrors({}); // Clear any remaining meta errors

        // 6. Prepare data payload for the backend API
        const quizDataForBackend = {
            // Send undefined if empty, backend controller will handle generation
            quizCode: quizCode.trim() || undefined,
            title: quizTitle.trim(),
            description: quizDescription.trim(),
            // Map frontend state to backend schema names
            questions: questions.map(q => ({
                questionText: q.questionText.trim(),
                image: q.image, // Pass Base64 string or null
                options: q.options.map(opt => opt.trim()),
                correctOptionIndex: q.correctAnswerIndex, // Name matches backend model
                points: Number(q.points), // Ensure points is a number
            })),
            // `createdBy` will be automatically added by the backend controller using the auth token
        };

        console.log("Sending quiz data to backend (image truncated):", {
            ...quizDataForBackend,
            questions: quizDataForBackend.questions.map(q => ({...q, image: q.image ? q.image.substring(0,50)+'...' : null}))
        });

        // 7. Make the API call
        try {
            // Use axiosInstance - handles base URL and auth token
            const response = await axiosInstance.post('/quizzes', quizDataForBackend);

            // --- Success ---
            const resultData = response.data; // Axios wraps response in .data
            console.log("Quiz saved successfully:", resultData);
            alert(`Quiz "${resultData.title}" saved successfully!\nCode: ${resultData.quizCode}`);

            // Reset form state completely
            setQuizTitle('');
            setQuizDescription('');
            setQuizCode('');
            setQuestions([]);
            setSelectedQuestionId(null);
            setFormErrors({});
            setQuizMetaErrors({});

        } catch (error) {
            console.error("Error saving quiz:", error.response?.data || error.message);
            const errorData = error.response?.data;
            const statusCode = error.response?.status;

            // Handle specific known backend errors
             if (statusCode === 401) {
                 alert("Authentication Error: Your session may have expired. Please log in again.");
                 localStorage.removeItem('quizAppToken');
                 localStorage.removeItem('quizAppUser');
                 navigate('/login');
             } else if (statusCode === 409 && errorData?.message?.includes('Quiz code')) { // Duplicate code error from backend
                 setQuizMetaErrors(prev => ({...prev, code: errorData.message }));
                 alert(`Error: ${errorData.message}`);
             } else if (statusCode === 400 && errorData?.errors) { // Backend validation errors array
                 alert(`Validation Errors from Server:\n- ${errorData.errors.join('\n- ')}`);
                 // Optional: Attempt to map backend errors back to specific questions/fields
             } else if (statusCode === 400 && errorData?.message) { // Other 400 errors with a message
                 alert(`Input Error: ${errorData.message}`);
             } else {
                 // Generic fallback error
                alert(`Failed to save quiz: ${errorData?.message || 'An unexpected server error occurred.'}`);
            }
        } finally {
            setIsSaving(false); // Ensure loading state is always turned off
        }
    };


    // --- JSX Rendering ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-8 px-4 font-sans">
            <div className="container mx-auto max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 shadow-md">
                    <h1 className="text-3xl md:text-4xl font-bold text-white text-center tracking-tight">
                        Awesome Quiz Builder
                    </h1>
                    <p className="text-center text-indigo-100 mt-2 text-sm md:text-base">Craft engaging quizzes with ease!</p>
                </div>

                <div className="p-4 md:p-6 lg:p-8">
                     {/* Quiz Metadata Section */}
                    <div className="mb-6 md:mb-8 p-4 md:p-6 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-5 text-gray-700 border-b pb-2">Quiz Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                             {/* Title Input */}
                             <div>
                                <label htmlFor="quizTitle" className="block text-sm font-medium text-gray-600 mb-1">Quiz Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text" id="quizTitle" value={quizTitle}
                                    onChange={(e) => handleQuizMetaChange('title', e.target.value)}
                                    placeholder="e.g., World Capitals Challenge"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition duration-200 ${quizMetaErrors.title ? 'border-red-500 ring-1 ring-red-300' : 'border-gray-300'}`}
                                    aria-required="true"
                                    aria-invalid={!!quizMetaErrors.title}
                                    aria-describedby={quizMetaErrors.title ? 'quizTitle-error' : undefined}
                                />
                                {quizMetaErrors.title && <p className="text-red-500 text-xs mt-1" id="quizTitle-error">{quizMetaErrors.title}</p>}
                            </div>
                            {/* Code Input */}
                             <div>
                                <label htmlFor="quizCode" className="block text-sm font-medium text-gray-600 mb-1">Custom Code (Optional)</label>
                                <input
                                    type="text" id="quizCode" value={quizCode}
                                    onChange={(e) => handleQuizMetaChange('code', e.target.value)}
                                    placeholder="AUTO-GEN OR CUSTOM (A-Z, 0-9, -_.)"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition duration-200 uppercase ${quizMetaErrors.code ? 'border-red-500 ring-1 ring-red-300' : 'border-gray-300'}`}
                                    aria-invalid={!!quizMetaErrors.code}
                                    aria-describedby={quizMetaErrors.code ? 'quizCode-error' : undefined}
                                />
                                 {quizMetaErrors.code && <p className="text-red-500 text-xs mt-1" id="quizCode-error">{quizMetaErrors.code}</p>}
                            </div>
                            {/* Description Input */}
                            <div className="md:col-span-2">
                                <label htmlFor="quizDescription" className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                                <textarea
                                    id="quizDescription" rows="2" value={quizDescription}
                                    onChange={(e) => handleQuizMetaChange('description', e.target.value)}
                                    placeholder="A short description of what the quiz is about."
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition duration-200 ${quizMetaErrors.description ? 'border-red-500 ring-red-300' : 'border-gray-300'}`}
                                    aria-describedby={quizMetaErrors.description ? 'quizDescription-error' : undefined}
                                ></textarea>
                                 {quizMetaErrors.description && <p className="text-red-500 text-xs mt-1" id="quizDescription-error">{quizMetaErrors.description}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid (Questions List & Editor) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

                        {/* --- Question List Panel (Column 1) --- */}
                        <div className="lg:col-span-1 flex flex-col">
                             {/* Add Question Button Section */}
                             <div className="flex items-center justify-between mb-3">
                                 <h2 className="text-lg md:text-xl font-semibold text-gray-700">
                                    Questions ({questions.length})
                                 </h2>
                                <button
                                    type="button"
                                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition duration-300 ease-in-out flex items-center shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                                        hasUnsavedChanges // Disable if current question has errors
                                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                    }`}
                                    onClick={addQuestion}
                                    disabled={hasUnsavedChanges}
                                    title={hasUnsavedChanges ? "Fix errors in the current question before adding" : "Add a new question"}
                                >
                                    <i className="fas fa-plus mr-1 md:mr-2"></i> Add
                                </button>
                            </div>
                            {/* Scrollable Question List Items */}
                            <div className="flex-grow space-y-2 md:space-y-3 max-h-[55vh] lg:max-h-[60vh] overflow-y-auto pr-2 pb-2 rounded-lg border border-gray-200 bg-gray-50 p-2 md:p-3 custom-scrollbar"> {/* Added flex-grow */}
                                {questions.length === 0 && (
                                    <p className="text-center text-gray-500 italic py-4 text-sm">No questions added yet. Click 'Add' to start.</p>
                                )}
                                {questions.map((question, index) => {
                                    const isSelected = selectedQuestionId === question.id;
                                    // Check if this specific question has errors (even if not currently selected)
                                    const questionErrors = validateForm(question);
                                    const hasErrorIndicator = Object.keys(questionErrors).length > 0;

                                    return (
                                        <div
                                            key={question.id}
                                            className={`relative flex items-center justify-between p-2 md:p-3 rounded-lg border cursor-pointer transition duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-1 focus:ring-indigo-300 focus:ring-offset-1 ${
                                                isSelected
                                                    ? 'bg-indigo-100 border-indigo-400 shadow-inner ring-1 ring-indigo-300' // Selected style
                                                    : 'bg-white hover:bg-gray-50 border-gray-200' // Default style
                                                } ${hasErrorIndicator ? '!border-red-400' : ''}` // Error border highlight (use !important if needed)
                                            }
                                            onClick={() => handleQuestionClick(question.id)}
                                            role="button"
                                            tabIndex={0} // Make focusable
                                            aria-current={isSelected ? "page" : undefined} // Better for screen readers
                                            aria-label={`Question ${index + 1}: ${question.questionText || 'Untitled'}${hasErrorIndicator ? '. This question has errors.' : ''}`}
                                        >
                                            {/* Error Indicator Icon */}
                                            {hasErrorIndicator && !isSelected && ( // Show only if not selected (errors shown in editor if selected)
                                                <span
                                                    className="absolute -top-1.5 -left-1.5 inline-block p-0.5 bg-red-500 border border-white rounded-full leading-none z-10"
                                                    title="This question has errors"
                                                >
                                                     <i className="fas fa-exclamation-triangle text-white text-[9px] md:text-[10px]"></i>
                                                </span>
                                            )}
                                            {/* Image Thumbnail or Placeholder */}
                                            {question.image ? (
                                                <img src={question.image} alt="" className="w-8 h-8 md:w-10 md:h-10 object-cover rounded mr-2 border border-gray-200 flex-shrink-0" aria-hidden="true"/>
                                            ) : (
                                                 <span className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-gray-200 text-gray-400 rounded mr-2 text-xs flex-shrink-0" aria-hidden="true"><i className="fas fa-image"></i></span>
                                            )}
                                            {/* Question Text Preview */}
                                            <span className="flex-1 text-xs md:text-sm font-medium text-gray-800 truncate pr-8"> {/* Padding for delete button */}
                                                {index + 1}. {question.questionText || <span className="italic text-gray-500">Untitled Question</span>}
                                            </span>
                                            {/* Delete Button */}
                                            <button
                                                type="button"
                                                className="absolute right-1 top-1/2 transform -translate-y-1/2 text-lg text-red-400 hover:text-red-600 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-red-300 rounded-full p-1 z-10 opacity-70 hover:opacity-100" // Ensure high z-index
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent question selection when clicking delete
                                                    deleteQuestion(question.id);
                                                }}
                                                title={`Delete Question ${index + 1}`}
                                                aria-label={`Delete Question ${index + 1}`}
                                            >
                                                <i className="fas fa-times-circle"></i> {/* Better delete icon */}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                             {/* Save Quiz Button */}
                            <div className="mt-auto pt-4 lg:pt-6 text-center lg:text-left"> {/* Use mt-auto to push to bottom */}
                                <button
                                    type="button"
                                    className={`w-full lg:w-auto px-6 py-2.5 md:px-8 md:py-3 rounded-lg text-base md:text-lg font-semibold transition duration-300 ease-in-out flex items-center justify-center shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                                        // Disable conditions: saving, current q has errors, or no questions
                                        isSaving || hasUnsavedChanges || questions.length === 0
                                        ? 'bg-gray-400 text-gray-700'
                                        : 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white transform hover:-translate-y-0.5 focus:ring-teal-500'
                                    }`}
                                    onClick={handleSaveQuiz}
                                    disabled={isSaving || hasUnsavedChanges || questions.length === 0}
                                >
                                    {isSaving ? (
                                        <> <i className="fas fa-spinner fa-spin mr-2"></i> Saving... </>
                                    ) : (
                                         <> <i className="fas fa-save mr-2"></i> Save Quiz </>
                                    )}
                                </button>
                                {/* Helper text for disabled states */}
                                {hasUnsavedChanges && <p className="text-red-500 text-xs mt-2 text-center lg:text-left">Fix current question errors before saving.</p>}
                                {questions.length === 0 && !isSaving && <p className="text-gray-500 text-xs mt-2 text-center lg:text-left">Add at least one question to save the quiz.</p>}
                             </div>
                        </div>

                        {/* --- Question Editor Panel (Column 2) --- */}
                        <div className="lg:col-span-2">
                             <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-3 flex items-center justify-between">
                                <span>
                                    {selectedQuestion ? `Editing Question ${questions.findIndex(q => q.id === selectedQuestionId) + 1}` : 'Question Editor'}
                                </span>
                                {/* Show error indicator in editor title if selected question has errors */}
                                {selectedQuestion && hasUnsavedChanges && (
                                    <span className="text-red-500 text-sm font-medium flex items-center animate-pulse" title="This question has errors">
                                        <i className="fas fa-exclamation-circle mr-1.5"></i> Fix Errors Below
                                    </span>
                                )}
                            </h2>
                            {selectedQuestion ? (
                                // Render the QuestionCard when a question is selected
                                // Use selectedQuestion.id as key to force re-mount on selection change if needed,
                                // though controlled inputs should handle updates correctly.
                                <QuestionCard
                                    key={selectedQuestion.id}
                                    question={selectedQuestion}
                                    updateQuestion={updateQuestion}
                                    updateOption={updateOption}
                                    handleImageChange={handleImageChange}
                                    formErrors={formErrors} // Pass errors specific to the selected question
                                />
                            ) : (
                                // Show placeholder when no question is selected
                                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center p-4 mt-2">
                                    <i className="fas fa-edit fa-2x mb-3 text-gray-400"></i>
                                    <p className="text-gray-500 italic text-sm md:text-base">
                                         {questions.length > 0
                                             ? "Select a question from the list to edit it here."
                                             : 'Click "Add Question" to create your first question.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
             {/* Optional Developer Note on Image Storage */}
             <p className="text-center text-xs text-gray-500 mt-4 px-4">Note: Images are stored as Base64. For production with many/large images, consider dedicated file storage (e.g., S3, Cloudinary) and storing only URLs.</p>
        </div>
    );
};


// --- Question Card Component ---
// Use React.memo for performance optimization if needed, but ensure props comparison is correct
const QuestionCard = React.memo(({ question, updateQuestion, updateOption, handleImageChange, formErrors = {} }) => {
    // Base styling classes for inputs
    const inputBaseClass = "w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent transition duration-200 shadow-sm text-sm md:text-base";
    const inputValidClass = "border-gray-300 focus:ring-indigo-400";
    const inputErrorClass = "border-red-500 ring-1 ring-red-400 focus:ring-red-400"; // More prominent error style

    return (
        // Added fade-in animation class (ensure CSS for animate-fadeIn is defined)
        <div className="p-4 md:p-5 border border-gray-200 rounded-lg bg-white shadow-md space-y-4 md:space-y-5 animate-fadeIn">

            {/* Question Text Input */}
            <div>
                <label htmlFor={`qtext-${question.id}`} className="block text-sm font-semibold text-gray-700 mb-1">
                    Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                    id={`qtext-${question.id}`}
                    rows="3"
                    className={`${inputBaseClass} ${formErrors.questionText ? inputErrorClass : inputValidClass}`}
                    placeholder="Enter the question here..."
                    value={question.questionText}
                    onChange={(e) => updateQuestion(question.id, 'questionText', e.target.value)}
                    required // HTML5 validation (less crucial as JS validation exists)
                    aria-required="true"
                    aria-invalid={!!formErrors.questionText}
                    aria-describedby={formErrors.questionText ? `qtext-${question.id}-error` : undefined}
                />
                {formErrors.questionText && <p className="text-red-500 text-xs mt-1" id={`qtext-${question.id}-error`}>{formErrors.questionText}</p>}
            </div>

            {/* Image Upload Input */}
            <div>
                <label htmlFor={`qimage-${question.id}`} className="block text-sm font-semibold text-gray-700 mb-1">
                    Image (Optional, max 5MB)
                </label>
                 <input
                    id={`qimage-${question.id}`}
                    type="file"
                    accept="image/png, image/jpeg, image/gif, image/webp" // Specify accepted types
                    // Use a dynamic key to allow re-uploading the same filename after removal
                    key={`file-input-${question.id}-${!question.image}`}
                    onChange={(e) => handleImageChange(question.id, e)}
                    className={`block w-full text-sm text-slate-500 file:cursor-pointer
                        file:mr-4 file:py-1.5 file:px-3 md:file:py-2 md:file:px-4
                        file:rounded-full file:border-0
                        file:text-xs md:file:text-sm file:font-semibold
                        file:bg-violet-50 file:text-violet-700
                        hover:file:bg-violet-100 transition duration-150
                        ${inputBaseClass} p-0 border-0 file:border-0 ring-1 ${formErrors.image ? 'ring-red-400' : 'ring-gray-300'} focus-within:ring-2 focus-within:ring-indigo-400`}
                    aria-invalid={!!formErrors.image}
                    aria-describedby={formErrors.image ? `qimage-${question.id}-error` : undefined}
                />
                 {formErrors.image && <p className="text-red-500 text-xs mt-1" id={`qimage-${question.id}-error`}>{formErrors.image}</p>}
                 {/* Image Preview and Remove Button */}
                 {question.image && (
                    <div className="mt-2 md:mt-3 relative group w-fit max-w-xs"> {/* Limit preview width */}
                        <p className="text-xs text-gray-500 mb-1">Preview:</p>
                        <img src={question.image} alt="Question preview" className="max-h-40 w-auto rounded-md border border-gray-300 shadow-sm" />
                        <button
                             type="button"
                             onClick={() => {
                                 updateQuestion(question.id, 'image', null); // Remove image from state
                             }}
                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs opacity-50 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 z-10"
                             title="Remove image"
                             aria-label="Remove image from question"
                         >
                            <i className="fas fa-times text-xs md:text-sm"></i>
                         </button>
                    </div>
                 )}
            </div>

            {/* Options Inputs */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Options (A, B, C, D) <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                    {question.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <label htmlFor={`qopt-${question.id}-${index}`} className="font-bold text-gray-600 w-6 text-center flex-shrink-0">{String.fromCharCode(65 + index)}.</label>
                            <input
                                id={`qopt-${question.id}-${index}`}
                                type="text"
                                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                                // Add error class specifically if options error exists (applies to all option inputs)
                                className={`${inputBaseClass} flex-1 ${formErrors.options ? inputErrorClass : inputValidClass}`}
                                value={option}
                                onChange={(e) => updateOption(question.id, index, e.target.value)}
                                required
                                aria-required="true"
                                aria-invalid={!!formErrors.options}
                                // Describe by general options error ID
                                aria-describedby={formErrors.options ? `qopt-error-${question.id}` : undefined}
                            />
                        </div>
                    ))}
                </div>
                {/* General error message for options */}
                {formErrors.options && <p className="text-red-500 text-xs mt-1" id={`qopt-error-${question.id}`}>{formErrors.options}</p>}
            </div>

            {/* Correct Answer Select */}
            <div>
                <label htmlFor={`qcorrect-${question.id}`} className="block text-sm font-semibold text-gray-700 mb-1">
                    Correct Answer <span className="text-red-500">*</span>
                </label>
                <select
                     id={`qcorrect-${question.id}`}
                     className={`${inputBaseClass} appearance-none ${formErrors.correctAnswerIndex ? inputErrorClass : inputValidClass}`} // Use appearance-none for custom arrow via Tailwind Forms plugin if installed
                     value={question.correctAnswerIndex ?? ''} // Handle null/undefined for select default state
                     onChange={(e) => {
                         const val = e.target.value;
                         // Convert empty string back to null, otherwise parse integer
                         updateQuestion(question.id, 'correctAnswerIndex', val === '' ? null : parseInt(val, 10));
                     }}
                     required
                     aria-required="true"
                     aria-invalid={!!formErrors.correctAnswerIndex}
                     aria-describedby={formErrors.correctAnswerIndex ? `qcorrect-${question.id}-error` : undefined}
                >
                    <option value="" disabled>-- Select correct option --</option>
                    {question.options.map((option, index) => (
                        // Disable option in dropdown if the corresponding text input is empty
                        <option key={index} value={index} disabled={!option?.trim()} >
                           {String.fromCharCode(65 + index)}. {truncateText(option?.trim(), 40) || `(Enter text for Option ${String.fromCharCode(65 + index)})`}
                        </option>
                    ))}
                </select>
                {formErrors.correctAnswerIndex && <p className="text-red-500 text-xs mt-1" id={`qcorrect-${question.id}-error`}>{formErrors.correctAnswerIndex}</p>}
            </div>

            {/* Points Input */}
            <div>
                 <label htmlFor={`qpoints-${question.id}`} className="block text-sm font-semibold text-gray-700 mb-1">
                    Points (Multiple of 10) <span className="text-red-500">*</span>
                </label>
                <input
                    id={`qpoints-${question.id}`}
                    type="number"
                    step="10" // Suggests steps in browser UI
                    min="10" // Minimum allowed value
                    className={`${inputBaseClass} ${formErrors.points ? inputErrorClass : inputValidClass}`}
                    placeholder="e.g., 10, 20, 30..."
                    // Display the value directly from state; handle empty string for null/undefined
                    value={question.points ?? ''} // Use ?? to show empty string if null/undefined
                     onChange={(e) => {
                         // Store the raw value or parsed number while typing
                         const rawValue = e.target.value;
                         if (rawValue === '') {
                             updateQuestion(question.id, 'points', ''); // Allow empty string while typing
                         } else {
                            // Try parsing, store number if valid int, otherwise keep raw string for validation
                             const numValue = parseInt(rawValue, 10);
                            updateQuestion(question.id, 'points', isNaN(numValue) ? rawValue : numValue);
                         }
                     }}
                     onBlur={(e) => {
                         // Validate and format correctly on blur
                         const rawValue = e.target.value;
                         const numValue = parseInt(rawValue, 10);

                         if (rawValue.trim() === '' || isNaN(numValue)) {
                             // If empty or not a number, set state to trigger validation error (or keep invalid string)
                              updateQuestion(question.id, 'points', rawValue.trim() === '' ? null : rawValue); // Set null if empty, else keep invalid string
                         } else if (numValue >= 10 && numValue % 10 === 0) {
                             // If it's a valid multiple of 10 and >= 10, store the number
                             updateQuestion(question.id, 'points', numValue);
                         } else {
                            // If invalid number (e.g., not multiple of 10, < 10), keep raw value for validation message
                             updateQuestion(question.id, 'points', rawValue);
                         }
                     }}
                     required
                     aria-required="true"
                     aria-invalid={!!formErrors.points}
                     aria-describedby={formErrors.points ? `qpoints-${question.id}-error` : undefined}
                />
                {formErrors.points && <p className="text-red-500 text-xs mt-1" id={`qpoints-${question.id}-error`}>{formErrors.points}</p>}
            </div>
        </div>
    );
});

// Helper function to truncate text (can be moved to a utils file)
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
}

// Add simple fade-in animation CSS if desired (e.g., in index.css or App.css)
/*
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
.custom-scrollbar::-webkit-scrollbar { width: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a1a1a1; }
*/

export default BuildQuiz;