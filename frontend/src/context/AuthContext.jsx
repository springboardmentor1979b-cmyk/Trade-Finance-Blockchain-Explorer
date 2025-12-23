import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const initAuth = async () => {
            setLoading(true);

            const token = localStorage.getItem("access_token");

            if (!token) {
                // Might still succeed if refresh cookie exists,
                // but you can rely on /auth/me to sort that out
            }

            try {
                await api.get("/api/auth/me"); // protected route using HTTPBearer in FastAPI
                setIsAuthenticated(true);
            } catch {
                setIsAuthenticated(false);
                localStorage.removeItem("access_token");
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = (tokens) => {
        localStorage.setItem("access_token", tokens.access_token);
        setIsAuthenticated(true);
        navigate("/dashboard");
    };

    const logout = () => {
        localStorage.clear();
        setIsAuthenticated(false);
        navigate("/login");
    };

    return (
        <AuthContext.Provider
            value={{ isAuthenticated, loading, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
