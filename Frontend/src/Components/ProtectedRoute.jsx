// src/Components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const token = localStorage.getItem('quizAppToken'); // Check if token exists

    // If no token, redirect to login page
    // The `replace` prop avoids adding the current route to history
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If token exists, render the nested routes (Outlet)
    return <Outlet />;
};

export default ProtectedRoute;