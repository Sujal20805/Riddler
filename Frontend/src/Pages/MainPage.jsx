import React from 'react';

function MainPage(){
    return(
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-500 p-6">
        <div className="text-center bg-white p-10 rounded-2xl shadow-2xl w-full max-w-3xl">
          <h1 className="text-5xl font-extrabold text-blue-700 mb-6">Welcome to the Main Page!</h1>
          <p className="text-lg text-gray-700 mb-6">
            Explore different sections and engage in exciting activities.
          </p>
          <div className="flex space-x-4">
            <button className="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-blue-800 shadow-md">
              Explore More
            </button>
            <button className="bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-indigo-800 shadow-md">
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
}

export default MainPage;