import React, { useState, useEffect, useCallback } from 'react';

// Helper function for basic validation (can be expanded)
const validateForm = (question) => {
    const errors = {};
    if (!question) return errors; // No question selected

    // Question Text
    if (!question.questionText?.trim()) {
        errors.questionText = 'Question text cannot be empty.';
    }

    // Image (basic check - more robust checks like size can be added in handleImageChange)
    if (question.image && typeof question.image !== 'string') {
         errors.image = 'Invalid image data.'; // Should rarely happen if handled correctly
    }

    // Options - Check if *all 4* are filled
    if (!Array.isArray(question.options) || question.options.length !== 4 || question.options.some(option => typeof option !== 'string' || !option.trim())) {
        errors.options = 'All 4 options must be filled.';
    }

    // Correct Answer Index - Allow 0
    if (question.correctAnswerIndex === null || question.correctAnswerIndex === undefined || isNaN(question.correctAnswerIndex) || question.correctAnswerIndex < 0 || question.correctAnswerIndex > 3) {
        errors.correctAnswerIndex = 'Please select a valid correct answer.';
    }

    // Points - Must be a positive multiple of 10
    const pointsNum = Number(question.points); // Coerce to number for checks
    if (question.points === null || question.points === '' || isNaN(pointsNum) || pointsNum <= 0 || pointsNum % 10 !== 0) {
        errors.points = 'Points must be a positive number, multiple of 10 (e.g., 10, 20).';
    }

    return errors;
};


const BuildQuiz = () => {
    const [quizTitle, setQuizTitle] = useState('');
    const [quizDescription, setQuizDescription] = useState('');
    const [quizCode, setQuizCode] = useState('');
    const [questions, setQuestions] = useState([]);
    const [selectedQuestionId, setSelectedQuestionId] = useState(null);
    const [formErrors, setFormErrors] = useState({}); // Errors for the *currently selected* question
    const [quizMetaErrors, setQuizMetaErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Find the currently selected question object
    const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

    // Memoized function to get current errors for the selected question
    // Use useCallback to prevent unnecessary re-creation unless selectedQuestion changes
    const getCurrentErrors = useCallback(() => {
        return validateForm(selectedQuestion);
    }, [selectedQuestion]);

    // Determine if the currently selected question has errors
    // Use useMemo for slightly better performance if component re-renders often
    const hasUnsavedChanges = React.useMemo(() => {
        return selectedQuestionId !== null && Object.keys(getCurrentErrors()).length > 0;
    }, [selectedQuestionId, getCurrentErrors]);

    // Update formErrors state ONLY when the selected question changes
    // This drives the error display in the QuestionCard
    useEffect(() => {
        setFormErrors(getCurrentErrors());
    }, [selectedQuestionId, questions, getCurrentErrors]); // Re-run if selectedId changes or questions list modifies the selected item

    // --- Event Handlers ---

    const handleQuizMetaChange = (field, value) => {
        if (field === 'title') setQuizTitle(value);
        if (field === 'description') setQuizDescription(value);
        if (field === 'code') setQuizCode(value.toUpperCase()); // Store code uppercase for consistency
        // Clear specific meta error when user types in the field
        if (quizMetaErrors[field]) {
             setQuizMetaErrors(prev => ({...prev, [field]: undefined}));
        }
    };

    // Checks validity of the currently selected question before proceeding
    const checkCurrentQuestionValidity = () => {
        if (selectedQuestionId) {
            const errors = validateForm(selectedQuestion);
            setFormErrors(errors); // Update UI to show current errors
            if (Object.keys(errors).length > 0) {
                alert("The currently selected question has errors. Please fix them before proceeding.");
                return false; // Invalid
            }
        }
        return true; // Valid or no question selected
    };

    const addQuestion = () => {
        // Check current question validity before adding a new one
        if (!checkCurrentQuestionValidity()) {
            return;
        }

        const newQuestion = {
            id: `temp_${Date.now()}_${Math.random()}`, // Temporary unique ID for React key
            questionText: '',
            image: null, // Initialize image as null
            options: ['', '', '', ''],
            correctAnswerIndex: null, // Use correct field name matching backend/validation
            points: 10, // Default points
        };
        setQuestions([...questions, newQuestion]);
        setSelectedQuestionId(newQuestion.id); // Select the new question
        setFormErrors({}); // Clear errors for the brand new question
    };

    // Update question field in state - No validation here
    const updateQuestion = (id, field, value) => {
        setQuestions(prevQuestions =>
            prevQuestions.map(q =>
                q.id === id ? { ...q, [field]: value } : q
            )
        );
        // Validation happens via useEffect when selectedQuestion changes, or via checkCurrentQuestionValidity()
    };

    // Update option field in state - No validation here
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
         // Validation happens via useEffect when selectedQuestion changes, or via checkCurrentQuestionValidity()
    };

    // Delete a question from the list
    const deleteQuestion = (idToDelete) => {
        const questionToDelete = questions.find(q => q.id === idToDelete);
        const questionText = questionToDelete?.questionText || 'this question';

        // Confirm deletion
        if (!confirm(`Are you sure you want to delete question "${questionText}"?`)) {
            return;
        }

        setQuestions(prev => prev.filter(q => q.id !== idToDelete));

        // If the deleted question was the selected one, clear the editor panel
        if (selectedQuestionId === idToDelete) {
            setSelectedQuestionId(null);
            setFormErrors({}); // Clear any errors associated with the deleted question
        }
    };

    // Handle image file selection and conversion to Base64
    const handleImageChange = (questionId, e) => {
        const file = e.target.files[0];
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB size limit (adjust as needed)

        if (file && file.type.startsWith('image/')) {
             if (file.size > MAX_SIZE) {
                 alert(`Image is too large (Max ${MAX_SIZE / 1024 / 1024}MB). Please choose a smaller file.`);
                 e.target.value = null; // Clear the file input
                 // Clear potential previous image validation error ONLY if it existed
                 if(formErrors.image) setFormErrors(prev => ({...prev, image: undefined}));
                 return;
             }
            const reader = new FileReader();
            reader.onloadend = () => {
                // Update state with Base64 string
                updateQuestion(questionId, 'image', reader.result);
                // Clear potential image validation error after successful load
                if(formErrors.image) setFormErrors(prev => ({...prev, image: undefined}));
            };
            reader.onerror = () => {
                console.error("Error reading image file.");
                alert("Error reading image file.");
                 updateQuestion(questionId, 'image', null); // Clear image on error
                 e.target.value = null;
            };
            reader.readAsDataURL(file);
        } else if (file) {
            alert("Please select a valid image file (e.g., JPG, PNG, GIF, WEBP).");
            e.target.value = null; // Clear the file input
            if(formErrors.image) setFormErrors(prev => ({...prev, image: undefined}));
        }
         // If no file is selected (user cancelled), do nothing - existing state remains
    };


    // Handle clicking on a question in the list
    const handleQuestionClick = (id) => {
        // If trying to switch *away* from a question with errors, prevent it
        if (selectedQuestionId !== null && selectedQuestionId !== id) {
             if (!checkCurrentQuestionValidity()) {
                 return; // Stop switching if current question is invalid
             }
        }
        // If clicking the same question or the current one is valid, allow selection
        setSelectedQuestionId(id);
        // Errors for the newly selected question will be updated by the useEffect hook
    };

    // Validate metadata fields (Title, Code format if provided)
    const validateQuizMeta = () => {
        const errors = {};
        if (!quizTitle.trim()) {
            errors.title = "Quiz title is required.";
        }
        // Code is optional, but validate format if user enters something
        if (quizCode.trim() && !/^[A-Z0-9_.-]+$/i.test(quizCode.trim())) {
            errors.code = "Quiz code can only contain letters, numbers, hyphens (-), underscores (_), and periods (.).";
        }
        // Optional: Add length validation for code if needed
        // if (quizCode.trim() && (quizCode.trim().length < 3 || quizCode.trim().length > 20)) {
        //     errors.code = "Quiz code must be between 3 and 20 characters.";
        // }
        setQuizMetaErrors(errors);
        return Object.keys(errors).length === 0; // Return true if no errors
    }

    // Handle the final "Save Quiz" button click
    const handleSaveQuiz = async () => {
        // **Crucial Prerequisite:** Ensure your frontend dev server (Vite/CRA) is configured
        // to proxy `/api` requests to your backend server (e.g., http://localhost:5000)
        // and that your backend server is running.

        // 1. Check validity of the *currently selected* question (if any)
        if (!checkCurrentQuestionValidity()) {
            // Alert is shown by checkCurrentQuestionValidity()
            return;
        }

        // 2. Validate Quiz Metadata (Title is required, Code format checked if present)
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

        // 4. Validate *ALL* questions in the list before sending to backend
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

        // 5. If an invalid question is found, select it and show errors
        if (firstInvalidQuestionId) {
             const invalidQuestion = questions[firstInvalidQuestionIndex];
             setSelectedQuestionId(firstInvalidQuestionId); // Select the invalid question in the UI
             setFormErrors(validateForm(invalidQuestion)); // Ensure its errors are shown in the editor
             alert(`Question ${firstInvalidQuestionIndex + 1} ("${invalidQuestion.questionText || 'Untitled'}") has errors. Please fix them before saving.`);
             return; // Stop the save process
        }

        // --- All Validations Passed ---

        // 6. Prepare data payload for the backend API
        const quizDataForBackend = {
            // Generate code if empty, otherwise use user's (already uppercased) code
            quizCode: quizCode.trim() || `QZ${Date.now()}`,
            title: quizTitle.trim(),
            description: quizDescription.trim(),
            // Map frontend state to backend schema, ensuring trimming and correct types
            questions: questions.map(q => ({
                questionText: q.questionText.trim(),
                image: q.image, // Pass the Base64 string or null
                options: q.options.map(opt => opt.trim()),
                correctOptionIndex: q.correctAnswerIndex, // Ensure this name matches backend Model/Schema
                points: Number(q.points), // Ensure points is a number
            })),
            // createdBy: "user_id_from_auth", // TODO: Replace with actual user ID if auth is implemented
        };

        setIsSaving(true);
        setQuizMetaErrors({}); // Clear meta errors on successful validation before save attempt
        console.log("Sending quiz data to backend (image truncated for console):", {
            ...quizDataForBackend,
            questions: quizDataForBackend.questions.map(q => ({...q, image: q.image ? q.image.substring(0,50)+'...' : null}))
        });

        // 7. Make the API call to the backend
        try {
            // Use relative path - requires proxy setup in dev environment (e.g., vite.config.js)
            const response = await fetch('/api/quizzes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                     // Add Authorization header if auth is implemented:
                     // 'Authorization': `Bearer ${your_auth_token}`
                },
                body: JSON.stringify(quizDataForBackend),
            });

            // Try to parse JSON response regardless of status code for potential error messages
            let resultData;
            try {
                resultData = await response.json();
            } catch (jsonError) {
                // Handle cases where the response is not JSON (e.g., HTML error page, network issue)
                console.error("Failed to parse JSON response:", jsonError);
                // Throw a more informative error based on status if possible
                throw new Error(`Server responded with status ${response.status} but not valid JSON. Check network tab or server logs.`);
            }


            if (!response.ok) {
                // Use message from backend JSON response if available, otherwise generic error
                const errorMessage = resultData.message || `HTTP error! Status: ${response.status}`;

                 // Handle specific known backend errors for better UX
                 if (response.status === 409 && resultData.message && resultData.message.includes('Quiz code')) { // Duplicate code
                     setQuizMetaErrors(prev => ({...prev, code: resultData.message }));
                     alert(`Error: ${resultData.message}`); // Show specific alert
                 } else if (response.status === 400 && resultData.errors) { // Backend validation errors
                     alert(`Validation Errors from Server:\n- ${resultData.errors.join('\n- ')}`);
                 } else {
                     // Generic error message for other failures
                    alert(`Failed to save quiz: ${errorMessage}`);
                 }
                 // Throw an error to stop execution flow and prevent resetting the form
                throw new Error(errorMessage);
            }

            // --- Success ---
            console.log("Quiz saved successfully (frontend):", resultData);
            alert(`Quiz "${resultData.title}" saved successfully! Code: ${resultData.quizCode}`);

            // Reset form state after successful save
            setQuizTitle('');
            setQuizDescription('');
            setQuizCode('');
            setQuestions([]);
            setSelectedQuestionId(null);
            setFormErrors({});
            setQuizMetaErrors({});

        } catch (error) {
            console.error("Error during save quiz process:", error);
            // Alert might have already been shown by the response handling block
            // Add a check to avoid double alerting if it was a handled HTTP error
            if (!String(error.message).startsWith('HTTP error') && !String(error.message).includes('Validation Errors')) {
                 alert(`An unexpected error occurred while saving: ${error.message}`);
            }
        } finally {
            setIsSaving(false); // Ensure loading state is turned off regardless of success/failure
        }
    };


    // --- JSX Rendering ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-8 px-4 font-sans">
            <div className="container mx-auto max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden">
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
                                />
                                {quizMetaErrors.title && <p className="text-red-500 text-xs mt-1" id="quizTitle-error">{quizMetaErrors.title}</p>}
                            </div>
                            {/* Code Input */}
                             <div>
                                <label htmlFor="quizCode" className="block text-sm font-medium text-gray-600 mb-1">Quiz Code (Optional)</label>
                                <input
                                    type="text" id="quizCode" value={quizCode}
                                    onChange={(e) => handleQuizMetaChange('code', e.target.value)}
                                    placeholder="AUTO-GEN OR CUSTOM (A-Z, 0-9, -_.)"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition duration-200 uppercase ${quizMetaErrors.code ? 'border-red-500 ring-1 ring-red-300' : 'border-gray-300'}`}
                                    aria-invalid={!!quizMetaErrors.code}
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
                                ></textarea>
                                 {quizMetaErrors.description && <p className="text-red-500 text-xs mt-1">{quizMetaErrors.description}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid (Questions List & Editor) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

                        {/* Question List (Column 1) */}
                        <div className="lg:col-span-1 space-y-4">
                             {/* Add Question Button Section */}
                             <div className="flex items-center justify-between mb-3">
                                 <h2 className="text-lg md:text-xl font-semibold text-gray-700">
                                    Questions ({questions.length})
                                 </h2>
                                <button
                                    type="button"
                                    // Disable button if the currently selected question has errors
                                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition duration-300 ease-in-out flex items-center shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                                        hasUnsavedChanges ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'
                                    }`}
                                    onClick={addQuestion}
                                    disabled={hasUnsavedChanges}
                                    title={hasUnsavedChanges ? "Fix errors in the current question before adding" : "Add a new question"}
                                >
                                    <i className="fas fa-plus mr-1 md:mr-2"></i> Add
                                </button>
                            </div>
                            {/* Scrollable Question List Items */}
                            <div className="space-y-2 md:space-y-3 max-h-[50vh] lg:max-h-[60vh] overflow-y-auto pr-2 pb-2 rounded-lg border border-gray-200 bg-gray-50 p-2 md:p-3">
                                {questions.length === 0 && (
                                    <p className="text-center text-gray-500 italic py-4 text-sm">No questions added yet. Click 'Add' to start.</p>
                                )}
                                {questions.map((question, index) => {
                                    const isSelected = selectedQuestionId === question.id;
                                    // Pre-calculate if this question has errors (even if not selected) for the indicator
                                    const questionErrors = validateForm(question);
                                    const hasErrorIndicator = Object.keys(questionErrors).length > 0;

                                    return (
                                        <div
                                            key={question.id}
                                            // Removed 'group' class as delete button is always visible now
                                            className={`relative flex items-center justify-between p-2 md:p-3 rounded-lg border cursor-pointer transition duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-md ${
                                                isSelected
                                                    ? 'bg-indigo-100 border-indigo-400 shadow-inner ring-1 ring-indigo-300' // Selected style
                                                    : 'bg-white hover:bg-gray-50 border-gray-200' // Default style
                                                } ${hasErrorIndicator ? 'border-red-300' : ''}` // Error border highlight
                                            }
                                            onClick={() => handleQuestionClick(question.id)}
                                            role="button" // Accessibility
                                            tabIndex={0} // Make it focusable
                                            aria-current={isSelected ? "true" : "false"} // Indicate selection
                                        >
                                            {/* Error Indicator Icon */}
                                            {hasErrorIndicator && (
                                                <span
                                                    className="absolute -top-1.5 -left-1.5 inline-block p-0.5 bg-red-500 border-2 border-white rounded-full leading-none z-10"
                                                    title="This question has errors that need fixing"
                                                >
                                                     <i className="fas fa-exclamation-triangle text-white text-[8px] md:text-[10px]"></i>
                                                </span>
                                            )}
                                            {/* Image Thumbnail */}
                                            {question.image ? (
                                                <img src={question.image} alt="Question thumbnail" className="w-8 h-8 md:w-10 md:h-10 object-cover rounded mr-2 border border-gray-200 flex-shrink-0"/>
                                            ) : (
                                                 <span className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-gray-200 text-gray-400 rounded mr-2 text-xs flex-shrink-0" aria-label="No image"><i className="fas fa-image"></i></span>
                                            )}
                                            {/* Question Text Preview */}
                                            <span className="flex-1 text-xs md:text-sm font-medium text-gray-800 truncate pr-8"> {/* Ensure padding for delete button */}
                                                {index + 1}. {question.questionText || <span className="italic text-gray-500">Untitled Question</span>}
                                            </span>
                                            {/* Delete Button (Always Visible) */}
                                            <button
                                                type="button"
                                                className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-lg text-red-500 hover:text-red-700 transition-colors duration-200 focus:outline-none p-1 z-10" // Ensure high z-index
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent triggering question selection
                                                    deleteQuestion(question.id);
                                                }}
                                                title="Delete Question"
                                                aria-label={`Delete question ${index + 1}`} // Accessibility
                                            >
                                                ❌
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                             {/* Save Quiz Button */}
                            <div className="mt-4 lg:mt-6 text-center lg:text-left">
                                <button
                                    type="button"
                                    className={`w-full lg:w-auto px-6 py-2.5 md:px-8 md:py-3 rounded-lg text-base md:text-lg font-semibold transition duration-300 ease-in-out flex items-center justify-center shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                        // Disable conditions: saving in progress, current q has errors, or no questions exist
                                        isSaving || hasUnsavedChanges || questions.length === 0
                                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white transform hover:-translate-y-0.5 focus:ring-teal-500'
                                    }`}
                                    onClick={handleSaveQuiz}
                                    disabled={isSaving || hasUnsavedChanges || questions.length === 0}
                                >
                                    {isSaving ? (
                                        <><i className="fas fa-spinner fa-spin mr-2"></i> Saving...</>
                                    ) : (
                                         <><i className="fas fa-save mr-2"></i> Save Quiz</>
                                    )}
                                </button>
                                {/* Helper text for disabled states */}
                                {hasUnsavedChanges && <p className="text-red-500 text-xs mt-2 text-center lg:text-left">Fix current question errors before saving.</p>}
                                {questions.length === 0 && !isSaving && <p className="text-gray-500 text-xs mt-2 text-center lg:text-left">Add at least one question to save the quiz.</p>}
                             </div>
                        </div>

                        {/* Question Editor (Column 2) */}
                        <div className="lg:col-span-2">
                             <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-3 flex items-center justify-between">
                                <span>
                                    {selectedQuestion ? `Editing Question ${questions.findIndex(q => q.id === selectedQuestionId) + 1}` : 'Question Editor'}
                                </span>
                                {selectedQuestion && hasUnsavedChanges && ( // Show error indicator in editor title too
                                    <span className="text-red-500 text-sm font-medium flex items-center animate-pulse" title="This question has errors">
                                        <i className="fas fa-exclamation-circle mr-1.5"></i> Fix Errors
                                    </span>
                                )}
                            </h2>
                            {selectedQuestion ? (
                                // Render the QuestionCard when a question is selected
                                <QuestionCard
                                    // Use selectedQuestion.id as key to force re-mount on selection change, resetting card state if needed
                                    key={selectedQuestion.id}
                                    question={selectedQuestion}
                                    updateQuestion={updateQuestion}
                                    updateOption={updateOption}
                                    handleImageChange={handleImageChange}
                                    formErrors={formErrors} // Pass errors specific to the selected question
                                />
                            ) : (
                                // Show placeholder when no question is selected
                                <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center p-4">
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
             <p className="text-center text-xs text-gray-500 mt-4 px-4">Note: Images are stored as Base64. For production apps with many/large images, consider dedicated file storage (e.g., S3, Cloudinary) and storing only image URLs in the database.</p>
        </div>
    );
};


// --- Question Card Component ---
// Use React.memo for performance optimization, only re-renders if props change
const QuestionCard = React.memo(({ question, updateQuestion, updateOption, handleImageChange, formErrors }) => {
    // Base styling classes for inputs
    const inputBaseClass = "w-full px-3 py-2 border rounded-md focus:ring-2 focus:border-transparent transition duration-200 shadow-sm text-sm md:text-base";
    const inputValidClass = "border-gray-300 focus:ring-indigo-400";
    const inputErrorClass = "border-red-500 ring-1 ring-red-400 focus:ring-red-400"; // More prominent error style

    return (
        // Added fade-in animation class (ensure CSS is defined elsewhere)
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
                    // Be specific about accepted image types
                    accept="image/png, image/jpeg, image/gif, image/webp"
                    // Use a dynamic key to allow re-uploading the same file name after removing the previous image
                    key={`file-input-${question.id}-${question.image === null}`}
                    onChange={(e) => handleImageChange(question.id, e)}
                    // Styling the file input itself can be tricky, style the container/wrapper if needed
                     className={`block w-full text-sm text-slate-500 file:cursor-pointer
                        file:mr-4 file:py-1.5 file:px-3 md:file:py-2 md:file:px-4
                        file:rounded-full file:border-0
                        file:text-xs md:file:text-sm file:font-semibold
                        file:bg-violet-50 file:text-violet-700
                        hover:file:bg-violet-100 transition duration-150
                        ${inputBaseClass} p-0 border-0 file:border-0 ring-1 ${formErrors.image ? 'ring-red-400' : 'ring-gray-300'} focus-within:ring-2 focus-within:ring-indigo-400`} // Style wrapper div
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
                             type="button" // Explicitly set type
                             onClick={() => {
                                 // When removing image, also clear potential validation error by updating state
                                 updateQuestion(question.id, 'image', null);
                                 // No need to manually clear formErrors.image here, the useEffect watching selectedQuestion will handle it
                             }}
                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs opacity-50 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 z-10"
                             title="Remove image"
                             aria-label="Remove image from question"
                         >
                            <i className="fas fa-times text-xs md:text-sm"></i> {/* Font Awesome icon */}
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
                                className={`${inputBaseClass} flex-1 ${formErrors.options ? inputErrorClass : inputValidClass}`}
                                value={option}
                                onChange={(e) => updateOption(question.id, index, e.target.value)}
                                aria-required="true"
                                aria-invalid={!!formErrors.options}
                                aria-describedby={formErrors.options ? `qopt-${question.id}-error` : undefined}
                            />
                        </div>
                    ))}
                </div>
                {formErrors.options && <p className="text-red-500 text-xs mt-1" id={`qopt-${question.id}-error`}>{formErrors.options}</p>}
            </div>

            {/* Correct Answer Select */}
            <div>
                <label htmlFor={`qcorrect-${question.id}`} className="block text-sm font-semibold text-gray-700 mb-1">
                    Correct Answer <span className="text-red-500">*</span>
                </label>
                <select
                     id={`qcorrect-${question.id}`}
                     // Use Tailwind class for better dropdown arrow styling (install @tailwindcss/forms if needed)
                     className={`${inputBaseClass} appearance-none ${formErrors.correctAnswerIndex ? inputErrorClass : inputValidClass}`}
                     value={question.correctAnswerIndex ?? ''} // Handle null/undefined for select default state
                     onChange={(e) => {
                         const val = e.target.value;
                         // Convert empty string back to null, otherwise parse integer
                         updateQuestion(question.id, 'correctAnswerIndex', val === '' ? null : parseInt(val, 10));
                     }}
                     aria-required="true"
                     aria-invalid={!!formErrors.correctAnswerIndex}
                     aria-describedby={formErrors.correctAnswerIndex ? `qcorrect-${question.id}-error` : undefined}
                >
                    <option value="" disabled>-- Select correct option --</option>
                    {question.options.map((option, index) => (
                        // Disable option if the corresponding text input is empty
                        <option key={index} value={index} disabled={!option?.trim()} >
                           {/* Show option letter and text, or placeholder if empty */}
                           {String.fromCharCode(65 + index)}. {option?.trim() || `(Enter text for Option ${String.fromCharCode(65 + index)})`}
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
                    step="10"
                    min="10" // Minimum points allowed
                    className={`${inputBaseClass} ${formErrors.points ? inputErrorClass : inputValidClass}`}
                    placeholder="e.g., 10, 20, 30..."
                    // Display the value directly from state; handle empty string for null/undefined
                    value={question.points === null || question.points === undefined ? '' : question.points}
                     onChange={(e) => {
                         // Store the raw value while typing for flexibility
                         updateQuestion(question.id, 'points', e.target.value);
                     }}
                     onBlur={(e) => {
                         // Validate and format correctly on blur
                         const rawValue = e.target.value;
                         const numValue = parseInt(rawValue, 10);

                         if (rawValue.trim() === '') {
                            // If user clears the field, set to null (validation will catch required error)
                             updateQuestion(question.id, 'points', null);
                         } else if (!isNaN(numValue) && numValue >= 10 && numValue % 10 === 0) {
                             // If it's a valid number, multiple of 10, and >= 10, update state with the number
                             updateQuestion(question.id, 'points', numValue);
                         } else {
                             // If invalid input (text, wrong number), keep the invalid string in state.
                             // The validation function (validateForm) will catch this and show the error message.
                             // This allows the user to see their invalid input.
                             updateQuestion(question.id, 'points', rawValue);
                         }
                     }}
                     aria-required="true"
                     aria-invalid={!!formErrors.points}
                     aria-describedby={formErrors.points ? `qpoints-${question.id}-error` : undefined}
                />
                {formErrors.points && <p className="text-red-500 text-xs mt-1" id={`qpoints-${question.id}-error`}>{formErrors.points}</p>}
            </div>
        </div>
    );
});

// Add simple fade-in animation CSS if desired (e.g., in index.css or App.css)
/*
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
*/

export default BuildQuiz;