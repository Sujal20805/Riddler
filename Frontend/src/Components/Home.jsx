import React from "react";
import { Link } from "react-router-dom";
function Home(){
    return(
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 to-pink-500 p-6">
        <div className="text-center bg-white p-10 rounded-2xl shadow-2xl w-full max-w-3xl">
          <h1 className="text-5xl font-extrabold text-purple-700 mb-6">Welcome to Our Quiz Platform!</h1>
          <p className="text-lg text-gray-700 mb-6">
            Challenge yourself with exciting quizzes, expand your knowledge, and compete with friends.
          </p>
          <p className="text-md text-gray-600 mb-6">
            Choose from a variety of topics, track your progress, and become a quiz champion!
          </p>
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <Link to="/login" className="bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-purple-800 shadow-md text-center">
              Login
            </Link>
            <button className="bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-pink-800 shadow-md">
              Learn More
            </button>
          </div>
        </div>
      </div>
    );
}

export default Home;