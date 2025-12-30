import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated, loading, role } = useAuth();
    if (loading) {
        return <div>loading....</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/unauthorized" replace />;
    }
    return <Outlet />;
};

export default ProtectedRoute;
