// --- START OF FILE Navbar.js ---

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import logo from "../assets/diff.png"; // Make sure this path is correct
// Optional: Import axiosInstance if you implement backend logout call
// import axiosInstance from "../api/axiosInstance";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  const handleLogout = async () => { // Make async if calling backend
      // Optional: Call backend logout endpoint if implemented
      // try {
      //     await axiosInstance.post('/auth/logout');
      //     console.log("Backend logout notified");
      // } catch (error) {
      //     console.error("Error notifying backend of logout:", error);
      //     // Decide if you still want to proceed with client-side logout
      // }

      // Clear local storage
      localStorage.removeItem('quizAppToken'); // Remove token
      localStorage.removeItem('quizAppUser'); // Remove user info

      setIsOpen(false); // Close mobile menu if open
      navigate('/login'); // Redirect to login page
  };

  // Check if user is logged in (simple check based on token existence)
  const isLoggedIn = !!localStorage.getItem('quizAppToken');


  return (
    // Using bg-sky-300 from your original Navbar.jsx
    <nav className="bg-sky-300 text-gray-900 p-4 shadow-lg relative"> {/* Use text-gray-900 or similar for contrast */}
      {/* Increased container width, center content */}
      <div className="container mx-auto max-w-6xl flex justify-between items-center">
         {/* Logo */}
         <Link to={isLoggedIn ? "/home" : "/"} className="flex items-center text-2xl font-bold">
             {/* Ensure hover bg matches desired style */}
           <img src={logo} alt="Logo" className="h-12 hover:opacity-80 transition" />
         </Link>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-3xl focus:outline-none p-2" // Added padding
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
          aria-expanded={isOpen} // Accessibility
        >
          {/* Font Awesome Icons */}
          {isOpen ? <i className="fas fa-times"></i> : <i className="fas fa-bars"></i>}
        </button>

        {/* Desktop Menu */}
        {/* Removed absolute positioning, use flex for layout */}
        <div className="hidden md:flex space-x-5 items-center">
            {isLoggedIn ? (
                // Logged In Links
                <>
                    <Link to="/home" className="hover:text-sky-600 hover:bg-sky-100 p-2 rounded transition duration-200">Home</Link>
                    <Link to="/build" className="hover:text-sky-600 hover:bg-sky-100 p-2 rounded transition duration-200">Build Quiz</Link>
                    <Link to="/leaderboard" className="hover:text-sky-600 hover:bg-sky-100 p-2 rounded transition duration-200">Leaderboard</Link>
                    <Link to="/faqs" className="hover:text-sky-600 hover:bg-sky-100 p-2 rounded transition duration-200">FAQ</Link>
                    <Link to="/profile" className="hover:text-sky-600 hover:bg-sky-100 p-2 rounded transition duration-200">Profile</Link>
                    <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition duration-200 shadow">
                        Logout
                    </button>
                </>
            ) : (
                 // Logged Out Links
                 <>
                     <Link to="/" className="hover:text-sky-600 hover:bg-sky-100 p-2 rounded transition duration-200">Home</Link>
                     <Link to="/about-us" className="hover:text-sky-600 hover:bg-sky-100 p-2 rounded transition duration-200">About</Link>
                     <Link to="/faq" className="hover:text-sky-600 hover:bg-sky-100 p-2 rounded transition duration-200">FAQ</Link>
                     <Link to="/login" className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition duration-200 shadow">Login</Link>
                     <Link to="/signup" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition duration-200 shadow">Sign Up</Link>
                 </>
            )}
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {/* Use absolute positioning for dropdown effect */}
      <div
        className={`absolute top-full left-0 right-0 md:hidden bg-sky-400 shadow-lg rounded-b-lg mt-0 py-2 transition-all duration-300 ease-out overflow-hidden ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0" // Animate height and opacity
        }`}
      >
        <div className="flex flex-col items-center space-y-2 px-4 pb-3"> {/* Added padding */}
            {isLoggedIn ? (
                <>
                     {/* Added onClick to close menu */}
                     <Link to="/home" onClick={() => setIsOpen(false)} className="block w-full text-center py-2 px-4 rounded hover:bg-sky-500 transition duration-200">Home</Link>
                     <Link to="/build" onClick={() => setIsOpen(false)} className="block w-full text-center py-2 px-4 rounded hover:bg-sky-500 transition duration-200">Build Quiz</Link>
                     <Link to="/leaderboard" onClick={() => setIsOpen(false)} className="block w-full text-center py-2 px-4 rounded hover:bg-sky-500 transition duration-200">Leaderboard</Link>
                     <Link to="/faqs" onClick={() => setIsOpen(false)} className="block w-full text-center py-2 px-4 rounded hover:bg-sky-500 transition duration-200">FAQ</Link>
                     <Link to="/profile" onClick={() => setIsOpen(false)} className="block w-full text-center py-2 px-4 rounded hover:bg-sky-500 transition duration-200">Profile</Link>
                     <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded w-full mt-2 transition duration-200 shadow">
                        Logout
                     </button>
                </>
             ) : (
                 <>
                     <Link to="/" onClick={() => setIsOpen(false)} className="block w-full text-center py-2 px-4 rounded hover:bg-sky-500 transition duration-200">Home</Link>
                     <Link to="/about-us" onClick={() => setIsOpen(false)} className="block w-full text-center py-2 px-4 rounded hover:bg-sky-500 transition duration-200">About</Link>
                     <Link to="/faq" onClick={() => setIsOpen(false)} className="block w-full text-center py-2 px-4 rounded hover:bg-sky-500 transition duration-200">FAQ</Link>
                     <Link to="/login" onClick={() => setIsOpen(false)} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded w-full mt-2 transition duration-200 shadow">Login</Link>
                     <Link to="/signup" onClick={() => setIsOpen(false)} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded w-full mt-1 transition duration-200 shadow">Sign Up</Link>
                 </>
             )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
// --- END OF FILE Navbar.js ---