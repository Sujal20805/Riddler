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
const router = createBrowserRouter([
  {
    path: "/",
    element: <PreApp />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/about-us",
        element: <AboutUsPage />,
      },
      {
        path: "/faq",
        element: <MainPage />,
      },
    ],
  },
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/quiz",
        element: <MainPage />,
      },
      {
        path: "/leaderboard",
        element: <MainPage />,
      },
      {
        path: "/home",
        element: <DashboardPage />,
      },
      {
        path: "/profile",
        element: <MainPage />,
      },
      {
        path: "/quiz-builder",
        element: <QuizBuilderPage />,
      },
      {
        path: "/aboutus",
        element: <AboutUsPage />,
      },
      {
        path: "/faqs",
        element: <MainPage />,
      },
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
]);

ReactDom.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);