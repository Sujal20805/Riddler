import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/diff.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-sky-300 text-white p-4 shadow-lg">
      <div className="container w-max flex justify-between items-center">
        <Link to="/" className="flex items-center text-2xl font-bold">
          <img src={logo} alt="Logo" className="w-25 h-12 hover:bg-blue-300" />
        </Link>

        <button
          className="md:hidden text-3xl text-gray-900 focus:outline-none absolute right-5" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu" 
        >
          
          {isOpen ? <i className="fa-solid fa-x"></i> : <i className="fa-solid fa-bars"></i>}
        </button>

        
        <div className="hidden md:flex space-x-6 absolute right-5"> 
          <Link to="/about-us" className="hover:text-emerald-400 hover:bg-blue-300 p-3 rounded">
            AboutUs & Contact
          </Link>
          <Link to="/faq" className="hover:text-emerald-400 hover:bg-blue-300 p-3 rounded">
            FAQ
          </Link>
          <Link to="/login" className="hover:text-emerald-400 hover:bg-blue-300 p-3 rounded">
            Login
          </Link>
        </div>
      </div>

      
      <div
        className={`${
          isOpen ? "block" : "hidden"
        } md:hidden bg-gray-700 shadow-md rounded mt-2 py-2`} 
      >
        <div className="flex flex-col items-center space-y-2">
          <Link
            to="/about-us"
            className="hover:text-emerald-400 block py-2 px-4 w-full text-center" // Added block, padding, and width
          >
            About & Contact
          </Link>
          <Link
            to="/faq"
            className="hover:text-emerald-400 block py-2 px-4 w-full text-center" // Added block, padding, and width
          >
            FAQ
          </Link>
          <Link
            to="/login"
            className="hover:text-emerald-400 block py-2 px-4 w-full text-center" // Added block, padding, and width
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;