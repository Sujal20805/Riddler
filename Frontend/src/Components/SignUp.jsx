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

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const handleValidate = () => {
    const errors = {};
    if (!username.trim()) {
      errors.username = "Username is required";
    } else if (username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!name.trim()) errors.name = "Full Name is required";

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email address is invalid";
    }

    if (!dob) {
      errors.dob = "Date of Birth is required";
    } else {
      const birthDate = new Date(dob);
      const today = new Date();
      if (birthDate > today) {
        errors.dob = "Date of Birth cannot be in the future";
      }
    }

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
      toast.error("Please resolve validation errors.");
      return;
    }
    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/register", {
        username: username.trim().toLowerCase(),
        name: name.trim(),
        email: email.trim(),
        dob,
        password,
      });

      localStorage.setItem('quizAppToken', response.data.token);
      localStorage.setItem('quizAppUser', JSON.stringify({
        _id: response.data._id,
        username: response.data.username,
        name: response.data.name
      }));

      toast.success("SIGNUP SUCCESSFUL! WELCOME PLAYER.");
      setTimeout(() => {
        navigate("/home");
      }, 1200);

    } catch (error) {
      console.error("Signup Failed:", error.response?.data || error.message);
      let message = "Signup failed. Please check inputs.";
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        message = error.response.data.errors.join('. ');
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      toast.error(message.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[95vh] bg-zinc-950 text-white scanlines game-dot-grid p-4">
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

      <Card variant="pink" className="w-full max-w-md my-8">
        <div className="flex flex-col items-center">
          {/* Centered Logo */}
          <div className="mb-6 flex justify-center">
            <Link to="/" className="inline-block p-1 bg-white border-2 border-black rotate-[-2deg] shadow-[2px_2px_0_0_#000]">
              <img src={logo} alt="Riddler Logo" className="h-14 w-auto object-contain" />
            </Link>
          </div>

          <Badge variant="volt" className="mb-4">NEW UNIT REGISTRATION</Badge>

          <h2 className="text-3xl font-black uppercase text-center text-white mb-6 font-heading tracking-wide">
            PLAYER SIGN UP
          </h2>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <FormField
              label="Username"
              id="username"
              placeholder="Pick a unique handle"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (validationErrors.username) setValidationErrors(prev => ({ ...prev, username: "" }));
              }}
              error={validationErrors.username}
              disabled={loading}
              icon="fa-solid fa-medal"
            />

            <FormField
              label="Full Name"
              id="name"
              placeholder="Enter your profile name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (validationErrors.name) setValidationErrors(prev => ({ ...prev, name: "" }));
              }}
              error={validationErrors.name}
              disabled={loading}
              icon="fa-solid fa-signature"
            />

            <FormField
              label="Email Address"
              id="email"
              type="email"
              placeholder="player@riddler.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validationErrors.email) setValidationErrors(prev => ({ ...prev, email: "" }));
              }}
              error={validationErrors.email}
              disabled={loading}
              icon="fa-solid fa-envelope"
            />

            <FormField
              label="Date of Birth"
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => {
                setDob(e.target.value);
                if (validationErrors.dob) setValidationErrors(prev => ({ ...prev, dob: "" }));
              }}
              error={validationErrors.dob}
              disabled={loading}
              max={new Date().toISOString().split("T")[0]}
            />

            <FormField
              label="Password"
              id="password"
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (validationErrors.password) setValidationErrors(prev => ({ ...prev, password: "" }));
              }}
              error={validationErrors.password}
              disabled={loading}
              icon="fa-solid fa-lock"
            />

            <Button
              type="submit"
              variant="pink"
              className="w-full mt-2"
              loading={loading}
            >
              CREATE GAME PROFILE
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-zinc-400 font-medium font-body">
            ALREADY REGISTERED?
            <Link to="/login" className="text-neon-pink hover:underline font-extrabold ml-1 uppercase">
              PLAYER LOGIN
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SignUp;