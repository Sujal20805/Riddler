import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/diff.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Username:", username, "Password:", password);
    navigate("/home");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-400 to-blue-500 p-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Centered Logo */}
        <div className="flex justify-center mb-4">
          <Link to="/" className="flex items-center text-2xl font-bold bg-emerald-200">
            <img src={logo} alt="Logo" className="w-30 h-20" />
          </Link>
        </div>
        <h2 className="text-4xl font-extrabold text-center text-green-700 mb-6">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-gray-800 font-semibold">Username</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-green-500 bg-gray-100"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-5">
            <label className="block text-gray-800 font-semibold">Password</label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-green-500 bg-gray-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-700 text-white p-3 rounded-lg hover:bg-green-800 font-bold shadow-md"
          >
            Login
          </button>
        </form>
        <p className="text-center mt-6 text-gray-800">
          Don't have an account?
          <Link to="/signup" className="text-green-700 hover:underline font-semibold ml-1">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;