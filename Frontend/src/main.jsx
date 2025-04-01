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
        element: <Faq />,
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
        element: <Profile />,
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
        element: <Faq />,
      },
      {
        path: "/play",
        element: <Play />,
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

export default main;