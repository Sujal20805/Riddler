import React from "react";
import Accordion from "./ui/Accordion";
import Badge from "./ui/Badge";

const Faq = () => {
  const faqData = [
    {
      title: "What is Riddler?",
      content:
        "Riddler is a fun and interactive Quiz Web App designed for creating, playing, and sharing quizzes. You can explore various quizzes on different topics, challenge your friends, and even create your own quizzes to share with others.",
    },
    {
      title: "How do I create a quiz on Riddler?",
      content:
        "To create a quiz, you need to sign up or log in to your Riddler account. Once logged in, navigate to the 'Create Quiz' section. Here, you can add a title, description, and questions to your quiz. You can choose from various question types and set options for each question. After creating your quiz, you can save and publish it for others to play.",
    },
    {
      title: "How do I play a quiz on Riddler?",
      content:
        "Playing a quiz on Riddler is easy! Simply browse the available quizzes on the homepage or explore categories. Click on a quiz you want to play, and the quiz page will load. Follow the instructions, answer the questions, and submit your quiz to see your score and results.",
    },
    {
      title: "Is Riddler free to use?",
      content:
        "Yes, Riddler is currently free to use. You can create and play quizzes without any subscription fees. We may introduce premium features in the future, but the core quiz creation and playing functionalities will remain free for all users.",
    },
    {
      title: "Can I share my quizzes with others?",
      content:
        "Absolutely! Once you've created and published a quiz, you can easily share it with others. You'll get a shareable link that you can send to your friends, post on social media, or embed on websites. Let others enjoy the quizzes you've created!",
    },
    {
      title: "What types of questions can I create on Riddler?",
      content:
        "Riddler supports various question types to make your quizzes engaging. Currently, you can create multiple-choice questions, true/false questions, and short answer questions. We plan to add more question types in the future to enhance quiz creation possibilities.",
    },
    {
      title: "Do I need an account to play quizzes?",
      content:
        "While you can browse and play many quizzes as a guest, creating an account on Riddler offers benefits like saving your quiz history, tracking your scores, and creating your own quizzes. Signing up is quick and easy!",
    },
    {
      title: "How can I contact support if I have more questions?",
      content:
        "If you have any other questions or need assistance, you can reach out to our support team via the 'Contact Us' page. We are always here to help and improve your experience with Riddler.",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white scanlines game-dot-grid flex flex-col py-12 px-4 relative overflow-hidden animate-scanline-laser">
      <div className="max-w-4xl mx-auto w-full z-10 flex-grow animate-slide-up">
        {/* Title Header */}
        <div className="text-center mb-12">
          <Badge variant="cyan" className="mb-4">TROUBLESHOOT SANDBOX</Badge>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white font-heading">
            SUPPORT & <span className="text-volt">FAQ</span>
          </h1>
          <p className="text-zinc-500 font-medium text-sm md:text-base mt-2 font-body max-w-lg mx-auto">
            Review the index of core operations and standard queries below. Click on any query block to expand its response.
          </p>
        </div>

        {/* Accordion Component */}
        <div className="mt-8">
          <Accordion items={faqData} />
        </div>
      </div>
    </div>
  );
};

export default Faq;
