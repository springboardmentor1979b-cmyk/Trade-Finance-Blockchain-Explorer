import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./context/ProtectedRoute.jsx";
import App from "./App.jsx";
import "./index.css";
import Login from "./components/Login.jsx";
import Signup from "./components/Signup.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Unauthorised from "./components/Unauthorised.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import Home from "./Home.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<App />}>
                        <Route index element={<Dashboard />} />
                        <Route path="login" element={<Login />} />
                        <Route path="signup" element={<Signup />} />
                        <Route
                            path="forgotpassword"
                            element={<ForgotPassword />}
                        />
                        <Route
                            element={
                                <ProtectedRoute
                                    allowedRoles={[
                                        "admin",
                                        "corporate",
                                        "auditor",
                                        "bank",
                                    ]}
                                />
                            }
                        >
                            <Route path="dashboard" element={<Home />} />
                        </Route>
                    </Route>
                    <Route path="/unauthorized" element={<Unauthorised />} />
                    <Route path="*" element={<div>404 Not Found</div>} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);
