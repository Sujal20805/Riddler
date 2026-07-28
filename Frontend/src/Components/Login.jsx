import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/diff.png";
import axiosInstance from "../api/axiosInstance";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from "./ui/Button";
import FormField from "./ui/FormField";
import Card from "./ui/Card";
import Badge from "./ui/Badge";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const handleValidate = () => {
    const errors = {};
    if (!username.trim()) errors.username = "Username is required";
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!handleValidate()) {
      toast.error("Please resolve validation issues.");
      return;
    }
    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/login", {
        username: username.trim(),
        password,
      });

      if (!response.data.token || !response.data._id || !response.data.username || !response.data.name) {
        console.error("Incomplete login response from backend:", response.data);
        toast.error("Login failed: Invalid response from server.");
        setLoading(false);
        return;
      }

      localStorage.setItem('quizAppToken', response.data.token);
      localStorage.setItem('quizAppUser', JSON.stringify({
        _id: response.data._id,
        username: response.data.username,
        name: response.data.name
      }));

      toast.success("LOGIN SUCCESSFUL! REDIRECTING...");
      setTimeout(() => {
        navigate("/home");
      }, 1000);

    } catch (error) {
      console.error("Login Failed:", error.response?.data || error.message);
      const message = error.response?.data?.message || "Login failed. Check server connection.";
      toast.error(message.toUpperCase());
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[90vh] bg-zinc-950 text-white scanlines game-dot-grid p-4">
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

      <Card variant="volt" className="w-full max-w-md my-8">
        <div className="flex flex-col items-center">
          {/* Centered Logo */}
          <div className="mb-6 flex justify-center">
            <Link to="/" className="inline-block p-1 bg-white border-2 border-black rotate-[-2deg] shadow-[2px_2px_0_0_#000]">
              <img src={logo} alt="Riddler Logo" className="h-14 w-auto object-contain" />
            </Link>
          </div>

          <Badge variant="cyan" className="mb-4">CREDENTIAL AUTHORIZATION</Badge>

          <h2 className="text-3xl font-black uppercase text-center text-white mb-6 font-heading tracking-wide">
            PLAYER LOGIN
          </h2>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
            <FormField
              label="Username"
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (validationErrors.username) setValidationErrors(prev => ({ ...prev, username: "" }));
              }}
              error={validationErrors.username}
              disabled={loading}
              icon="fa-solid fa-user-ninja"
            />

            <FormField
              label="Password"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (validationErrors.password) setValidationErrors(prev => ({ ...prev, password: "" }));
              }}
              error={validationErrors.password}
              disabled={loading}
              icon="fa-solid fa-key"
            />

            <Button
              type="submit"
              variant="volt"
              className="w-full mt-2"
              loading={loading}
            >
              AUTHENTICATE PLAYER
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-zinc-400 font-medium font-body">
            NEW PLAYER?
            <Link to="/signup" className="text-volt hover:underline font-extrabold ml-1 uppercase">
              REGISTER ACCOUNT
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;