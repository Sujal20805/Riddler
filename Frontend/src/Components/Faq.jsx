// Faq.jsx
import React from "react";
import { Link } from "react-router-dom";

const Faq = () => {
  const faqData = [
    {
      question: "What is Riddler?",
      answer:
        "Riddler is a fun and interactive Quiz Web App designed for creating, playing, and sharing quizzes. You can explore various quizzes on different topics, challenge your friends, and even create your own quizzes to share with others.",
    },
    {
      question: "How do I create a quiz on Riddler?",
      answer:
        "To create a quiz, you need to sign up or log in to your Riddler account. Once logged in, navigate to the 'Create Quiz' section. Here, you can add a title, description, and questions to your quiz. You can choose from various question types and set options for each question. After creating your quiz, you can save and publish it for others to play.",
    },
    {
      question: "How do I play a quiz on Riddler?",
      answer:
        "Playing a quiz on Riddler is easy! Simply browse the available quizzes on the homepage or explore categories. Click on a quiz you want to play, and the quiz page will load. Follow the instructions, answer the questions, and submit your quiz to see your score and results.",
    },
    {
      question: "Is Riddler free to use?",
      answer:
        "Yes, Riddler is currently free to use. You can create and play quizzes without any subscription fees. We may introduce premium features in the future, but the core quiz creation and playing functionalities will remain free for all users.",
    },
    {
      question: "Can I share my quizzes with others?",
      answer:
        "Absolutely! Once you've created and published a quiz, you can easily share it with others. You'll get a shareable link that you can send to your friends, post on social media, or embed on websites. Let others enjoy the quizzes you've created!",
    },
    {
      question: "What types of questions can I create on Riddler?",
      answer:
        "Riddler supports various question types to make your quizzes engaging. Currently, you can create multiple-choice questions, true/false questions, and short answer questions. We plan to add more question types in the future to enhance quiz creation possibilities.",
    },
    {
      question: "Do I need an account to play quizzes?",
      answer:
        "While you can browse and play many quizzes as a guest, creating an account on Riddler offers benefits like saving your quiz history, tracking your scores, and creating your own quizzes. Signing up is quick and easy!",
    },
    {
      question: "How can I contact support if I have more questions?",
      answer:
        "If you have any other questions or need assistance, you can reach out to our support team via the 'Contact Us' page. We are always here to help and improve your experience with Riddler.",
    },
    // Add more FAQs here as needed
  ];

  return (
    <div className="bg-gray-50 py-12 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to know about Riddler
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Find answers to the most common questions about using Riddler. If
            you can't find what you're looking for, please contact us.
          </p>
        </div>

        <div className="mt-12">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {faqData.map((item, index) => (
              <div key={index} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <i className="fas fa-question-circle fa-lg"></i>{" "}
                    {/* Font Awesome Question Icon */}
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                    {item.question}
                  </p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Faq;
