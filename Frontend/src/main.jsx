import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ReactDom from "react-dom/client";
import App from "./App.jsx";
import MainPage from "./Pages/MainPage.jsx";
import Home from "./Components/Home.jsx";
import Login from "./Pages/Login.jsx";
import SignUp from "./Pages/SignUp.jsx";
import AboutUs from "./Pages/AboutUs.jsx";
import BuildQuiz from "./Components/BuildQuiz.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/quiz",
        element: <MainPage />,
      },
      {
        path: "/leaderboard",
        element: <MainPage />,
      },
      {
        path: "/Home",
        element: <Home />,
      },
      {
        path: "/about-us",
        element: <AboutUs />,
      },
      {
        path: "/faq",
        element: <MainPage />,
      },
      {
        path: "/profile",
        element: <MainPage />,
      },
      {
        path: "/quiz-builder",
        element: <BuildQuiz />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
]);

ReactDom.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);