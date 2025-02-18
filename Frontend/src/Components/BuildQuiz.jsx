import React, { useState } from 'react';

const BuildQuiz = () => {
  const [questions, setQuestions] = useState([]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        questionText: '',
        image: null,
        options: ['', '', '', ''],
        correctAnswerIndex: null,
        points: 10,
      },
    ]);
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

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold">Quiz Builder</h1>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                {questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    updateQuestion={updateQuestion}
                    updateOption={updateOption}
                    deleteQuestion={deleteQuestion}
                    handleImageChange={handleImageChange}
                  />
                ))}
                <button
                  type="button"
                  className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={addQuestion}
                >
                  Add Question
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuestionCard = ({
  question,
  updateQuestion,
  updateOption,
  deleteQuestion,
  handleImageChange,
}) => {
  return (
    <div className="mb-4 p-4 border rounded-md bg-white shadow-sm">
      <div className="mb-2">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Question:
        </label>
        <input
          type="text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={question.questionText}
          onChange={(e) =>
            updateQuestion(question.id, 'questionText', e.target.value)
          }
        />
      </div>

      <div className="mb-2">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Image:
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

      <div className="mb-2">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Options:
        </label>
        {question.options.map((option, index) => (
          <input
            key={index}
            type="text"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-1"
            value={option}
            onChange={(e) => updateOption(question.id, index, e.target.value)}
          />
        ))}
      </div>

      <div className="mb-2">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Correct Answer:
        </label>
        <select
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={question.correctAnswerIndex === null ? '' : question.correctAnswerIndex}
          onChange={(e) =>
            updateQuestion(
              question.id,
              'correctAnswerIndex',
              parseInt(e.target.value)
            )
          }
        >
          <option value="">Select Correct Answer</option>
          {question.options.map((option, index) => (
            <option key={index} value={index}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-2">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Points:
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

      <button
        type="button"
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={() => deleteQuestion(question.id)}
      >
        Delete Question
      </button>
    </div>
  );
};

export default BuildQuiz;