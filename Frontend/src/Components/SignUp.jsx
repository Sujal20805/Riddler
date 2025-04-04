// --- START OF FILE SignUp.js ---

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/diff.png"; // Make sure this path is correct
import axiosInstance from "../api/axiosInstance"; // Import instance
// Optional: import toast stuff if needed
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.post("/auth/register", {
        username: username.toLowerCase(), // Send username lowercase for consistency
        name,
        email,
        dob,
        password,
      });

      console.log("Signup Success:", response.data);

       // Automatically log in the user after signup
      localStorage.setItem('quizAppToken', response.data.token);
      localStorage.setItem('quizAppUser', JSON.stringify({
            _id: response.data._id,
            username: response.data.username, // Use username from response
            name: response.data.name          // Use name from response
        }));

      // toast.success("Signup Successful!");
      alert("Signup Successful! You are now logged in."); // Simple alert
      navigate("/home"); // Redirect to dashboard

    } catch (error) {
      console.error("Signup Failed:", error.response?.data || error.message);
      // Handle specific validation errors if backend sends an array
       let message = "Signup failed. Please check your input.";
        if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
            message = error.response.data.errors.join('\n');
        } else if (error.response?.data?.message) {
            message = error.response.data.message;
        }
      // toast.error(message);
      alert(message); // Simple alert
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 p-4">
          {/* Optional: <ToastContainer position="top-center" autoClose={3000} /> */}
          <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <Link to="/" className="flex items-center text-2xl font-bold">
                 {/* Ensure bg-purple-400 is desired or remove */}
                <img src={logo} alt="Logo" className="w-30 h-20" />
              </Link>
            </div>
            {/* Title */}
            <h2 className="text-4xl font-extrabold text-center text-blue-700 mb-6">Sign Up</h2>
            {/* Form */}
            <form onSubmit={handleSubmit}>
                 {/* Username Input */}
                 <div className="mb-5">
                    <label className="block text-gray-800 font-semibold">Username</label>
                    <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 bg-gray-100"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                    />
                 </div>
                 {/* Name Input */}
                 <div className="mb-5">
                    <label className="block text-gray-800 font-semibold">Full Name</label>
                    <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 bg-gray-100"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={loading}
                    />
                 </div>
                 {/* Email Input */}
                 <div className="mb-5">
                    <label className="block text-gray-800 font-semibold">Email</label>
                    <input
                        type="email"
                        className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 bg-gray-100"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                 </div>
                 {/* DOB Input */}
                 <div className="mb-5">
                    <label className="block text-gray-800 font-semibold">Date of Birth</label>
                    <input
                        type="date"
                        className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 bg-gray-100"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        required
                        disabled={loading}
                        max={new Date().toISOString().split("T")[0]} // Optional: Prevent future dates
                    />
                 </div>
                 {/* Password Input */}
                 <div className="mb-5">
                    <label className="block text-gray-800 font-semibold">Password</label>
                    <input
                        type="password"
                        className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 bg-gray-100"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength="6" // Add minLength to match backend validation
                        disabled={loading}
                    />
                 </div>
                {/* Submit Button */}
                <button
                    type="submit"
                    className={`w-full bg-blue-700 text-white p-3 rounded-lg hover:bg-blue-800 font-bold shadow-md transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                >
                    {loading ? 'Signing Up...' : 'Sign Up'}
                </button>
            </form>
            {/* Login Link */}
            <p className="text-center mt-6 text-gray-800">
              Already have an account?
              <Link to="/login" className="text-blue-700 hover:underline font-semibold ml-1">Login</Link>
            </p>
          </div>
      </div>
  );
};

export default SignUp;
// --- END OF FILE SignUp.js ---