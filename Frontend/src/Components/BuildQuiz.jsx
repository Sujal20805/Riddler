import React, { useState } from 'react';

const BuildQuiz = () => {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isAddingNewQuestion, setIsAddingNewQuestion] = useState(false);

  const addQuestion = () => {
    if (selectedQuestionId !== null) {
      const errors = validateForm(selectedQuestion);
      if (Object.keys(errors).length > 0) {
        alert("Please save the current question before adding a new one.");
        return;
      }
    }

    const newQuestion = {
      id: Date.now(),
      questionText: '',
      image: null,
      options: ['', '', '', ''],
      correctAnswerIndex: null,
      points: 10,
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestionId(newQuestion.id);
    setIsAddingNewQuestion(true);
    setFormErrors({});
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(
      questions.map((question) =>
        question.id === id ? { ...question, [field]: value } : question
      )
    );
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(
      questions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.map((option, index) =>
                index === optionIndex ? value : option
              ),
            }
          : question
      )
    );
  };

  const deleteQuestion = (id) => {
    if (selectedQuestionId === id) {
      const errors = validateForm(selectedQuestion);
      if (Object.keys(errors).length > 0) {
        if (!confirm("Are you sure you want to delete this unsaved question?")) {
          return;
        }
      }
      setFormErrors({});
      setSelectedQuestionId(null);
      setIsAddingNewQuestion(false);
    }

    setQuestions(questions.filter((question) => question.id !== id));
  };

  const handleImageChange = (questionId, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateQuestion(questionId, 'image', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (question) => {
    const errors = {};
    if (!question.questionText) {
      errors.questionText = 'Question text is required.';
    }
    if (question.options.some(option => !option)) {
      errors.options = 'All options are required.';
    }
    if (question.correctAnswerIndex === null || isNaN(question.correctAnswerIndex)) { // Check for NaN
      errors.correctAnswerIndex = 'Correct answer is required.';
    }
    return errors;
  };

  const handleSaveQuestion = () => {
    if (!selectedQuestion) return;  // Added this check

    const errors = validateForm(selectedQuestion);
    setFormErrors(errors);


    if (Object.keys(errors).length === 0) {
        // Find and update the question in the array
        const updatedQuestions = questions.map(question => {
            if (question.id === selectedQuestion.id) {
                return selectedQuestion; // Replace with the updated question
            }
            return question;
        });

        setQuestions(updatedQuestions); // Update the state with the modified array
        setIsAddingNewQuestion(false);
    }
  };

  const handleQuestionClick = (id) => {
    if (selectedQuestionId !== null && selectedQuestionId !== id) {
      const errors = validateForm(selectedQuestion);
      if (Object.keys(errors).length > 0) {
        alert("Please save the current question before switching.");
        return;
      }
    }

    setSelectedQuestionId(id);
    setFormErrors({});
    setIsAddingNewQuestion(false);
  };


  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-semibold mb-4 text-center text-gray-800">Quiz Builder</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Question List (Column 1) */}
              <div className="lg:col-span-1">
                <h2 className="text-lg font-semibold mb-2 text-gray-700">Questions</h2>
                <div className="space-y-2">
                  {questions.map((question) => (
                    <div
                      key={question.id}
                      className={`flex items-center justify-between p-3 border rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer ${
                        selectedQuestionId === question.id ? 'bg-blue-100' : ''
                      }`}
                      onClick={() => handleQuestionClick(question.id)}
                    >
                      <span className="text-sm font-medium text-gray-800">{question.questionText || `Question ${questions.indexOf(question) + 1}`}</span>
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700 focus:outline-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteQuestion(question.id);
                        }}
                      >
                        {/* Font Awesome Delete Icon */}
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={addQuestion}
                    disabled={selectedQuestionId !== null && isAddingNewQuestion && Object.keys(validateForm(selectedQuestion)).length > 0}
                  >
                    Add Question
                  </button>
                </div>
              </div>

              {/* Question Editor (Column 2) */}
              <div className="lg:col-span-2">
                <h2 className="text-lg font-semibold mb-2 text-gray-700">
                  {selectedQuestion ? 'Edit Question' : 'Add/Select a Question'}
                </h2>
                {selectedQuestion ? (
                  <QuestionCard
                    question={selectedQuestion}
                    updateQuestion={updateQuestion}
                    updateOption={updateOption}
                    handleImageChange={handleImageChange}
                    formErrors={formErrors}
                  />
                ) : (
                  <div className="text-gray-500 italic">Select a question to edit, or add a new one.</div>
                )}
                 {selectedQuestion && (
                        <button
                            type="button"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-3"
                            onClick={handleSaveQuestion}
                        >
                            Save Question
                        </button>
                    )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuestionCard = ({ question, updateQuestion, updateOption, handleImageChange, formErrors }) => {

  return (
    <div className="p-6 border rounded-md bg-white shadow-sm">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Question:
        </label>
        <input
          type="text"
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formErrors.questionText ? 'border-red-500' : ''}`}
          value={question.questionText}
          onChange={(e) => updateQuestion(question.id, 'questionText', e.target.value)}
        />
        {formErrors.questionText && <p className="text-red-500 text-xs italic">{formErrors.questionText}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Image (Optional):
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageChange(question.id, e)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        {question.image && (
          <img src={question.image} alt="Question" className="mt-2 max-h-40" />
        )}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Options (A, B, C, D):
        </label>
        {question.options.map((option, index) => (
          <div key={index} className="flex items-center mb-2">
            <span className="mr-2 font-bold">{String.fromCharCode(65 + index)}.</span>
            <input
              type="text"
              className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formErrors.options ? 'border-red-500' : ''}`}
              value={option}
              onChange={(e) => updateOption(question.id, index, e.target.value)}
            />
          </div>
        ))}
        {formErrors.options && <p className="text-red-500 text-xs italic">All options are required.</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Correct Answer:
        </label>
        <select
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${formErrors.correctAnswerIndex ? 'border-red-500' : ''}`}
          value={question.correctAnswerIndex === null ? '' : question.correctAnswerIndex}
          onChange={(e) => updateQuestion(question.id, 'correctAnswerIndex', parseInt(e.target.value))}
        >
          <option value="">Select Correct Answer</option>
          {question.options.map((option, index) => (
            <option key={index} value={index}>
              {String.fromCharCode(65 + index)}. {option}
            </option>
          ))}
        </select>
        {formErrors.correctAnswerIndex && <p className="text-red-500 text-xs italic">{formErrors.correctAnswerIndex}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Points (Multiples of 10):
        </label>
        <input
          type="number"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={question.points}
          onChange={(e) => {
            const value = parseInt(e.target.value);
            if (value % 10 === 0) {
              updateQuestion(question.id, 'points', value);
            }
          }}
        />
      </div>
    </div>
  );
};

export default BuildQuiz;