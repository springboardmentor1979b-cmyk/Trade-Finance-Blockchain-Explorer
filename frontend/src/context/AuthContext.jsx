import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    useRef,
} from "react";
import api from "../api/axios.js";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const initializedRef = useRef(false);

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    const initAuth = async () => {
        setLoading(true);
        if (!localStorage.getItem("access_token")) {
            setLoading(false);
            return;
        }

        try {
            const res = await api.get("/api/auth/me");
            setUser(res.data);
            setIsAuthenticated(true);
        } catch {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem("access_token");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (initializedRef.current) return;
        initializedRef.current = true;

        initAuth();
    }, []);

    const login = async (tokens, user) => {
        localStorage.setItem("access_token", tokens.access_token);
        setUser(user);
        setIsAuthenticated(true);
        navigate("/dashboard");
    };

    const logout = async () => {
        try {
            await api.post("/api/auth/logout");
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            localStorage.clear();
            setUser(null);
            setIsAuthenticated(false);
            navigate("/");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-slate-200 h-16 w-16"></div>
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                loading,
                user,
                role: user?.role,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
