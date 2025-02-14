import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ReactDom from "react-dom/client";
import App from "./App.jsx";
import MainPage from "./Pages/MainPage.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <MainPage />,
      },
      {
        path: "/quiz",
        element: <MainPage />,
      },
      {
        path: "/feed",
        element: <MainPage />,
      },
      {
        path: "/companies",
        element: <MainPage />,
      },
      {
        path: "/connections",
        element: <MainPage />,
      },
      {
        path: "/jobs",
        element: <MainPage />,
      },
      {
        path: "/profile",
        element: <MainPage />,
      },
    ],
  },
  {
    path: "/login",
    element: <MainPage />,
  },
  {
    path: "/signup",
    element: <MainPage />,
  },
]);

ReactDom.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);