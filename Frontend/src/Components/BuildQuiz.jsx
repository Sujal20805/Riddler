// src/Components/BuildQuiz.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axiosInstance from "../api/axiosInstance"; // Import instance
import { useNavigate } from 'react-router-dom'; // For redirect on unauthorized

// Keep validateForm function
const validateForm = (question) => { /* ... (same as before) ... */ };
const QuestionCard = React.memo(({ question, updateQuestion, updateOption, handleImageChange, formErrors }) => { /* ... (same as before) ... */ });


const BuildQuiz = () => {
    // ... (keep existing state variables: quizTitle, quizDescription, etc.) ...
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate(); // Add navigate

    // ... (keep existing functions: getCurrentErrors, hasUnsavedChanges, useEffect for formErrors) ...
    // ... (keep: handleQuizMetaChange, checkCurrentQuestionValidity, addQuestion, updateQuestion, updateOption, deleteQuestion, handleImageChange, handleQuestionClick, validateQuizMeta) ...

    // Modify handleSaveQuiz
    const handleSaveQuiz = async () => {
        // ... (keep validations 1-5: checkCurrent, validateMeta, ensure one question, validate ALL questions) ...

        // --- All Validations Passed ---

        // 6. Prepare data payload for the backend API
        const quizDataForBackend = {
            quizCode: quizCode.trim() || undefined, // Send undefined if empty, backend will generate
            title: quizTitle.trim(),
            description: quizDescription.trim(),
            questions: questions.map(q => ({
                questionText: q.questionText.trim(),
                image: q.image,
                options: q.options.map(opt => opt.trim()),
                correctOptionIndex: q.correctAnswerIndex, // Ensure name matches backend Model/Schema
                points: Number(q.points),
            })),
            // createdBy is handled by the backend using the JWT token
        };

        setIsSaving(true);
        setQuizMetaErrors({});
        console.log("Sending quiz data to backend (image truncated):", {
            ...quizDataForBackend,
            questions: quizDataForBackend.questions.map(q => ({...q, image: q.image ? q.image.substring(0,50)+'...' : null}))
        });

        // 7. Make the API call to the backend
        try {
            // Use axiosInstance - handles base URL and token automatically
            const response = await axiosInstance.post('/quizzes', quizDataForBackend);

            // --- Success ---
            const resultData = response.data; // Axios puts data directly in response.data
            console.log("Quiz saved successfully (frontend):", resultData);
            alert(`Quiz "${resultData.title}" saved successfully! Code: ${resultData.quizCode}`);

            // Reset form state
            setQuizTitle('');
            setQuizDescription('');
            setQuizCode('');
            setQuestions([]);
            setSelectedQuestionId(null);
            setFormErrors({});
            setQuizMetaErrors({});

        } catch (error) {
            console.error("Error during save quiz process:", error.response?.data || error.message);

            const errorData = error.response?.data;
            const statusCode = error.response?.status;

            // Handle specific backend errors
            if (statusCode === 401) {
                 alert("Authentication Error: Your session may have expired. Please log in again.");
                 localStorage.removeItem('quizAppToken');
                 localStorage.removeItem('quizAppUser');
                 navigate('/login'); // Redirect to login
                 return; // Stop further processing
            } else if (statusCode === 409 && errorData?.message?.includes('Quiz code')) { // Duplicate code
                 setQuizMetaErrors(prev => ({...prev, code: errorData.message }));
                 alert(`Error: ${errorData.message}`);
            } else if (statusCode === 400 && errorData?.errors) { // Backend validation errors
                 // Try to highlight fields if possible, otherwise show generic alert
                 alert(`Validation Errors from Server:\n- ${errorData.errors.join('\n- ')}`);
                 // You might want to parse errorData.errors to map them back to specific form fields
            } else if (statusCode === 400 && errorData?.message) { // Other 400 errors
                 alert(`Error: ${errorData.message}`);
            }
             else {
                 // Generic error message
                alert(`Failed to save quiz: ${errorData?.message || 'An unexpected error occurred.'}`);
            }
        } finally {
            setIsSaving(false);
        }
    };


    // --- JSX Rendering --- (Keep the existing JSX structure)
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-8 px-4 font-sans">
            {/* ... rest of the JSX ... */}
             {/* The QuestionCard component remains the same */}
        </div>
    );
};

// Keep the QuestionCard component as it is

export default BuildQuiz;