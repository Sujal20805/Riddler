import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/diff.png";
import axiosInstance from "../api/axiosInstance"; // Import the configured instance
import { toast, ToastContainer } from 'react-toastify'; // Optional: for better feedback
import 'react-toastify/dist/ReactToastify.css';      // Optional: Toast CSS

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.post("/auth/login", {
        username,
        password,
      });

      console.log("Login Success:", response.data);

      // Store token and user info
      localStorage.setItem('quizAppToken', response.data.token);
      localStorage.setItem('quizAppUser', JSON.stringify({ // Store basic user info
          _id: response.data._id,
          username: response.data.username,
          name: response.data.name
      }));

      // toast.success("Login Successful!"); // Optional toast
      navigate("/home"); // Redirect to dashboard

    } catch (error) {
      console.error("Login Failed:", error.response?.data || error.message);
      const message = error.response?.data?.message || "Login failed. Please try again.";
      // toast.error(message); // Optional toast
      alert(message); // Simple alert for now
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-400 to-blue-500 p-4">
      {/* Optional: Add ToastContainer here if using react-toastify */}
      {/* <ToastContainer position="top-center" autoClose={3000} /> */}
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
        {/* ... rest of the form ... */}
         <div className="mb-5">
            <label className="block text-gray-800 font-semibold">Username</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-green-500 bg-gray-100"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
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
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className={`w-full bg-green-700 text-white p-3 rounded-lg hover:bg-green-800 font-bold shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        {/* ... rest of the component ... */}
      </div>
    </div>
  );
};

export default Login;