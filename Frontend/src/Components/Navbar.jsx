import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/diff.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("quizAppToken");
    localStorage.removeItem("quizAppUser");
    setIsOpen(false);
    navigate("/login");
  };

  const isLoggedIn = !!localStorage.getItem("quizAppToken");

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setIsOpen(false)}
        className={`px-3 py-1.5 font-heading text-xs md:text-sm font-black uppercase tracking-wider transition-all border-2 ${isActive
          ? "border-black bg-volt text-black shadow-[2px_2px_0px_0px_#000000]"
          : "border-transparent text-zinc-300 hover:text-white hover:border-zinc-700"
          }`}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav className="bg-zinc-950 border-b-[4px] border-black sticky top-0 z-50 py-3 px-4 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
      <div className="container mx-auto max-w-6xl flex justify-between items-center">
        {/* Brand Logo */}
        <Link
          to={isLoggedIn ? "/home" : "/"}
          className="flex items-center gap-2 hover:scale-105 transition-transform duration-100 group"
        >
          <img src={logo} alt="Riddler" className="h-10 border-2 border-black bg-white px-2 py-0.5 shadow-[2px_2px_0_0_#000]" />
          <span className="font-heading font-black text-2xl tracking-tighter text-white uppercase italic select-none group-hover:animate-text-glitch">
            Riddler<span className="text-volt">.</span>
          </span>
        </Link>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center border-2 border-black bg-volt text-black active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shadow-[2px_2px_0px_0px_#000000] focus:outline-none"
          aria-label="Toggle Menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <i className="fa-solid fa-xmark"></i> : <i className="fa-solid fa-bars"></i>}
        </button>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <NavLink to="/home">Game Board</NavLink>
              <NavLink to="/build">Build Quiz</NavLink>
              <NavLink to="/leaderboard">Leaderboard</NavLink>
              <NavLink to="/faqs">FAQ</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              <button
                onClick={handleLogout}
                className="brutalist-btn bg-neon-pink text-white px-4 py-1.5 text-xs md:text-sm shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-pink-600 cursor-pointer"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/about-us">About Us</NavLink>
              <NavLink to="/faq">FAQ</NavLink>
              <Link
                to="/login"
                className="brutalist-btn bg-zinc-900 border-2 border-black text-white px-4 py-1.5 text-xs md:text-sm shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-zinc-800"
              >
                LOGIN
              </Link>
              <Link
                to="/signup"
                className="brutalist-btn bg-volt text-black px-4 py-1.5 text-xs md:text-sm shadow-[2px_2px_0px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-volt-dark"
              >
                SIGN UP
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile navigation panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 border-b-[4px] border-black bg-zinc-950 p-4 transition-all duration-300 md:hidden shadow-[0_4px_0_0_rgba(0,0,0,1)]">
          <div className="flex flex-col gap-3 items-center">
            {isLoggedIn ? (
              <>
                <NavLink to="/home">Game Board</NavLink>
                <NavLink to="/build">Build Quiz</NavLink>
                <NavLink to="/leaderboard">Leaderboard</NavLink>
                <NavLink to="/faqs">FAQ</NavLink>
                <NavLink to="/profile">Profile</NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full brutalist-btn bg-neon-pink text-white py-2 text-sm shadow-[3px_3px_0px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none hover:bg-pink-600 cursor-pointer"
                >
                  LOGOUT
                </button>
              </>
            ) : (
              <>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/about-us">About Us</NavLink>
                <NavLink to="/faq">FAQ</NavLink>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center brutalist-btn bg-zinc-900 text-white py-2 text-sm shadow-[3px_3px_0px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none hover:bg-zinc-800"
                >
                  LOGIN
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center brutalist-btn bg-volt text-black py-2 text-sm shadow-[3px_3px_0px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none hover:bg-volt-dark"
                >
                  SIGN UP
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;