import React from "react";
import { Link } from "react-router-dom";
function Home(){
    return(
<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-6">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-4xl">
        <h1 className="text-5xl font-extrabold text-blue-700 text-center mb-6">About Riddler</h1>
        
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-purple-700 mb-4">Who We Are</h2>
          <p className="text-gray-700 text-lg">
            Riddler is an innovative online quiz platform designed for knowledge seekers, trivia lovers, and competitive minds. 
            Our platform offers a wide variety of quizzes, ranging from general knowledge to specialized topics. Whether you're here 
            to test your intelligence, learn new things, or compete with friends, Riddler provides a fun and interactive experience for all.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold text-purple-700 mb-4">Our Vision</h2>
          <p className="text-gray-700 text-lg">
            Our vision is to create the ultimate hub for quiz enthusiasts where learning meets entertainment. We aim to make knowledge
            accessible and engaging by offering an intuitive and competitive platform that encourages curiosity and intellectual growth.
            Through Riddler, we aspire to connect like-minded individuals across the globe and foster a community of lifelong learners.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold text-purple-700 mb-4">Our Motto</h2>
          <p className="text-gray-700 text-lg">
            "Challenge. Learn. Conquer." At Riddler, we believe in the power of challenge as a means of growth. Our motto embodies our
            core philosophy—every quiz is an opportunity to challenge yourself, learn new things, and ultimately conquer your goals.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold text-purple-700 mb-4">Our Goals</h2>
          <p className="text-gray-700 text-lg">
            - To provide a diverse and constantly growing database of quizzes covering various topics and difficulty levels.<br/>
            - To create a fair and competitive environment where users can challenge their friends and test their knowledge.<br/>
            - To integrate new technologies and gamification elements to enhance user engagement and experience.<br/>
            - To build a global community of quiz lovers who can share knowledge and improve their skills.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-bold text-purple-700 mb-4">Contact Us</h2>
          <p className="text-gray-700 text-lg mb-4">
            Have questions or need support? Reach out to us!
          </p>
          <div className="bg-gray-100 p-6 rounded-lg">
            <p className="text-lg text-gray-800"><strong>Email:</strong> support@riddler.com</p>
            <p className="text-lg text-gray-800"><strong>Phone:</strong> +91 1234567890</p>
            <p className="text-lg text-gray-800"><strong>Address:</strong> 123 Quiz Street, Trivia City, Knowledge Land</p>
          </div>
        </section>
      </div>
    </div>
    );
}

export default Home;