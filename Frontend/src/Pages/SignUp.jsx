import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/diff.png";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Username:", username, "Name:", name, "Email:", email, "DOB:", dob, "Password:", password);
    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 p-4">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-center mb-4">
                  <Link to="/" className="flex items-center text-2xl font-bold">
                    <img src={logo} alt="Logo" className="w-30 h-20 bg-purple-400" />
                  </Link>
                </div>
        <h2 className="text-4xl font-extrabold text-center text-blue-700 mb-6">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-gray-800 font-semibold">Username</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 bg-gray-100"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-5">
            <label className="block text-gray-800 font-semibold">Full Name</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 bg-gray-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-5">
            <label className="block text-gray-800 font-semibold">Email</label>
            <input
              type="email"
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 bg-gray-100"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-5">
            <label className="block text-gray-800 font-semibold">Date of Birth</label>
            <input
              type="date"
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 bg-gray-100"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>
          <div className="mb-5">
            <label className="block text-gray-800 font-semibold">Password</label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 bg-gray-100"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-700 text-white p-3 rounded-lg hover:bg-blue-800 font-bold shadow-md"
          >
            Sign Up
          </button>
        </form>
        <p className="text-center mt-6 text-gray-800">
          Already have an account?
          <Link to="/login" className="text-blue-700 hover:underline font-semibold ml-1">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
