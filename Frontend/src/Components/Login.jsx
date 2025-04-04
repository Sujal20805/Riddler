import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/diff.png"; // Verify this path is correct
import axiosInstance from "../api/axiosInstance"; // Import the configured instance
import { toast, ToastContainer } from 'react-toastify'; // Using react-toastify
import 'react-toastify/dist/ReactToastify.css';      // Toast CSS

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Clear previous toasts if any
    // toast.dismiss();

    try {
      const response = await axiosInstance.post("/auth/login", {
        username: username, // Send username as typed (backend handles lowercase lookup)
        // username: username.toLowerCase(), // Or send lowercase directly
        password,
      });

      console.log("Login Success:", response.data);

      // --- Ensure response.data has the expected fields ---
      if (!response.data.token || !response.data._id || !response.data.username || !response.data.name) {
          console.error("Incomplete login response from backend:", response.data);
          toast.error("Login failed: Invalid response from server.");
          setLoading(false);
          return; // Stop execution
      }
      // --- End Check ---


      // Store token and user info in localStorage
      localStorage.setItem('quizAppToken', response.data.token);
      localStorage.setItem('quizAppUser', JSON.stringify({ // Store basic user info
          _id: response.data._id,
          username: response.data.username,
          name: response.data.name
      }));

      toast.success("Login Successful!");
      // Add a small delay before navigating to allow toast to show (optional)
      setTimeout(() => {
         navigate("/home"); // Redirect to dashboard
      }, 1000);


    } catch (error) {
      console.error("Login Failed:", error.response?.data || error.message);
      // Extract error message from backend response if available
      const message = error.response?.data?.message || "Login failed. Please check credentials or server status.";
      toast.error(message); // Show error toast
    } finally {
      // Ensure loading is always set to false, even after navigation delay
       setTimeout(() => setLoading(false), 500); // Delay slightly to avoid UI flicker if navigation is fast
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-400 to-blue-500 p-4">
      {/* Toast Container for notifications */}
      <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
      />
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Centered Logo */}
        <div className="flex justify-center mb-4">
          <Link to="/" className="flex items-center text-2xl font-bold">
             {/* Ensure bg-emerald-200 is desired or remove if logo has bg */}
            <img src={logo} alt="Logo" className="w-30 h-20" />
          </Link>
        </div>
        {/* Title */}
        <h2 className="text-4xl font-extrabold text-center text-green-700 mb-6">Login</h2>
        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Username Input */}
          <div className="mb-5">
            <label className="block text-gray-800 font-semibold mb-1">Username</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 transition duration-200"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your username"
            />
          </div>
          {/* Password Input */}
          <div className="mb-5">
            <label className="block text-gray-800 font-semibold mb-1">Password</label>
            <input
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 transition duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 font-bold shadow-md transition duration-200 ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'}`}
            disabled={loading}
          >
            {loading ? (
                 <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                 </span>
            ) : (
                'Login'
            )}
          </button>
        </form>
        {/* Signup Link */}
        <p className="text-center mt-6 text-gray-800">
          Don't have an account?
          <Link to="/signup" className="text-green-700 hover:underline font-semibold ml-1">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;