// Dashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';


const Dashboard = () => {

  // Dummy data for quiz cards (3 rows)
  const quizData = [
    [
      { id: 1, title: "General Knowledge", topic: "general", image: "https://via.placeholder.com/200x150/3498db/ffffff?text=General+Knowledge" },
      { id: 2, title: "Science Quiz", topic: "science", image: "https://via.placeholder.com/200x150/2ecc71/ffffff?text=Science" },
      { id: 3, title: "History Trivia", topic: "history", image: "https://via.placeholder.com/200x150/e74c3c/ffffff?text=History" },
      { id: 4, title: "Math Challenge", topic: "math", image: "https://via.placeholder.com/200x150/f39c12/ffffff?text=Math" },
    ],
    [
      { id: 5, title: "Geography Quiz", topic: "geography", image: "https://via.placeholder.com/200x150/9b59b6/ffffff?text=Geography" },
      { id: 6, title: "Literature Test", topic: "literature", image: "https://via.placeholder.com/200x150/1abc9c/ffffff?text=Literature" },
      { id: 7, title: "Pop Culture", topic: "pop_culture", image: "https://via.placeholder.com/200x150/e67e22/ffffff?text=Pop+Culture" },
      { id: 8, title: "Coding Quiz", topic: "coding", image: "https://via.placeholder.com/200x150/7f8c8d/ffffff?text=Coding" },
    ],
    [
      { id: 9, title: "Music Theory", topic: "music", image: "https://via.placeholder.com/200x150/2c3e50/ffffff?text=Music" },
      { id: 10, title: "Art History", topic: "art", image: "https://via.placeholder.com/200x150/d35400/ffffff?text=Art" },
      { id: 11, title: "Sports Quiz", topic: "sports", image: "https://via.placeholder.com/200x150/27ae60/ffffff?text=Sports" },
      { id: 12, title: "Movie Trivia", topic: "movies", image: "https://via.placeholder.com/200x150/8e44ad/ffffff?text=Movies" },
    ]
  ];

  // Dummy leaderboard data
  const leaderboardData = {
    quizName: "General Knowledge Quiz",
    date: "2024-07-28",
    topScores: [
      { username: "User1", score: 95 },
      { username: "User2", score: 92 },
      { username: "User3", score: 88 },
    ]
  };


  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Create Quiz Card */}
      <Link to="/quiz-builder">
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 mb-8 cursor-pointer">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Create a New Quiz</h2>
          <p className="text-lg">Start building your own quiz now!</p>
          <i className="fas fa-plus-circle text-4xl mt-4"></i> {/* FontAwesome Icon */}
        </div>
      </Link>

      {/* Quiz Card Carousels */}
      <div className="mb-8">
          {quizData.map((row, rowIndex) => (
            <div key={rowIndex} className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Quiz Category {rowIndex + 1}</h2>
              <div className="flex overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                 {/*Added scrollbar */}
                {row.map((quiz) => (
                  <Link key={quiz.id} to={`#`}> {/* Replace '#' with actual quiz link */}
                    <div  className="flex-none w-64 h-56 mr-6 bg-white rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition duration-300 cursor-pointer">
                      <img src={quiz.image} alt={quiz.title} className="w-full h-32 object-cover rounded-t-lg" />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-1">{quiz.title}</h3>
                        <p className="text-gray-600">{quiz.topic}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow-md p-4 fixed top-20 right-4 md:w-1/4 w-1/2 transition-transform duration-200 ease-in-out transform hover:scale-105">
          <h2 className="text-lg font-bold mb-3">Last Quiz Leaderboard</h2>
          <p className="text-gray-700 mb-1">Quiz: {leaderboardData.quizName}</p>
          <p className="text-gray-700 mb-2">Date: {leaderboardData.date}</p>
          <ul>
            {leaderboardData.topScores.map((score, index) => (
              <li key={index} className="flex justify-between items-center py-1">
                <span>{score.username}</span>
                <span>{score.score}</span>
              </li>
            ))}
          </ul>
       </div>

    </div>
  );
};

export default Dashboard;