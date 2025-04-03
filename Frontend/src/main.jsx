import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ReactDom from "react-dom/client";
import App from "./App.jsx";
import MainPage from "./Pages/MainPage.jsx";
import Home from "./Components/Home.jsx";
import LoginPage from "./Pages/Login.page.jsx";
import SignupPage from "./Pages/Signup.page.jsx";
import QuizBuilderPage from "./Pages/QuizBuilder.page.jsx";
import AboutUsPage from "./Pages/AboutUs.page.jsx";
import PreApp from "./PreApp.jsx";
import DashboardPage from "./Pages/Dashboard.page.jsx";
import Profile from "./Components/Profile.jsx";
import Faq from "./Components/Faq.jsx";
import Play from "./Components/Play.jsx";
// Helper Component
import ProtectedRoute from "./Components/ProtectedRoute.js" // Import the guard

const router = createBrowserRouter([
  // --- Public Routes ---
  {
    path: "/",
    element: <PreApp />, // Layout for non-logged-in users
    children: [
      {
        index: true, // Makes this the default route for "/"
        element: <Home />,
      },
      {
        path: "about-us", // Relative path
        element: <AboutUsPage />,
      },
      {
        path: "faq", // Relative path
        element: <Faq />,
      },
       // Add other public pages here if needed
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },

  // --- Protected Routes ---
  {
    element: <ProtectedRoute />, // Wrap protected routes
    children: [
      {
        path: "/", // Base path for logged-in area (can share with public if needed, but separate layout helps)
        element: <App />, // Layout for logged-in users (includes Navbar)
        children: [
          {
            // Redirect '/' inside protected route to '/home' or make '/home' the index
            index: true,
            element: <DashboardPage />, // Default logged-in page
          },
          {
            path: "home", // Explicit path to dashboard
            element: <DashboardPage />,
          },
          {
             path: "leaderboard",
             element: <LeaderboardPage />, // Assuming you create this page component
             // If MainPage was intended for leaderboard, use: element: <MainPage />,
           },
           {
             path: "profile",
             element: <Profile />,
           },
           {
             path: "build",
             element: <QuizBuilderPage />,
           },
            {
             path: "faqs", // Logged-in FAQ?
             element: <FaqLoggedIn />, // Or reuse <Faq /> if identical
           },
           {
             // Use :quizCode parameter for playing specific quiz
             path: "play/:quizCode",
             element: <Play />,
           },
           // Remove duplicate/unused routes like /quiz if covered by /home or /play
        ],
      },
    ],
  },
  // Catch-all or Not Found route (optional)
  // {
  //   path: "*",
  //   element: <div>404 Not Found</div>
  // }
]);

ReactDom.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);