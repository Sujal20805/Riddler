import React from "react";
import { Link } from "react-router-dom";
function Home(){
    return(
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 to-pink-500 p-4">
        <div className="text-center bg-white p-10 rounded-2xl shadow-2xl w-full max-w-2xl">
          <h1 className="text-5xl font-extrabold text-purple-700 mb-6">Welcome to Our Quiz App!</h1>
          <p className="text-lg text-gray-700 mb-6">
            Test your knowledge with our fun and challenging quizzes. Improve your skills and learn new things every day!
          </p>
          <button className="bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-purple-800 shadow-md">
            Start Quiz
          </button>
        </div>
      </div>
    );
}

export default Home;