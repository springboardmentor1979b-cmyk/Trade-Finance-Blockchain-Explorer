import Card from "./ui/Card.jsx";
import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios.js";
import { Eye, EyeClosed } from "lucide-react";
import toast from "react-hot-toast";
import RoleSelect from "./ui/Select.jsx";

function Signup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [loadingEmailCheck, setLoadingEmailCheck] = useState(false);
    const [password, setPassword] = useState("");
    const [passwordAgain, setPasswordAgain] = useState("");
    const [passwordmatcherror, setPasswordMatchError] = useState("");
    const [role, setRole] = useState("");
    const [org_name, setOrg_name] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [strength, setStrength] = useState("");
    const navigate = useNavigate();

    const colors = {
        weak: "text-red-500 italic",
        medium: "text-orange-500 italic",
        strong: "text-green-500 italic",
    };

    function isValidEmail(email) {
        return /\S+@\S+\.\S+/.test(email);
    }

    useEffect(() => {
        if (!email) {
            setEmailError("");
            return;
        }

        if (!isValidEmail(email)) {
            setEmailError("invalid Email format");
            return;
        } else {
            setEmailError("");
        }
        const timer = setTimeout(async () => {
            try {
                setLoadingEmailCheck(true);

                const res = await api.get(
                    `/api/auth/check-email?email=${email}`
                );
                if (res.data.exists) {
                    toast.error("Email is already registered");
                } else {
                    toast.success("Email is available");
                }
            } catch (err) {
                toast.error("Error checking email");
            } finally {
                setLoadingEmailCheck(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [email]);

    const cleanUpForm = () => {
        setName("");
        setEmail("");
        setPassword("");
        setPasswordAgain("");
        setRole("");
        setOrg_name("");
        setStrength("");
        setPasswordMatchError("");
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        try {
            const response = await api.post("/api/auth/register", {
                name,
                org_name,
                role,
                email,
                password,
            });
            navigate("/login");
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Signup failed. Please try again."
            );
            toast.error(err?.response?.data?.detail || "Signup failed");
        } finally {
            cleanUpForm();
        }
    };

    function evaluatePasswordStrength(password) {
        let score = 0;

        if (!password) return "";
        if (password.length > 8) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/\d/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        switch (score) {
            case 0:
            case 1:
            case 2:
                return "Weak";
            case 3:
                return "Medium";
            case 4:
            case 5:
                return "Strong";
            default:
                return "Weak";
        }
    }

    function checkPasswordMatch(pwd) {
        if (pwd !== password) {
            setPasswordMatchError("Passwords do not match!!");
        } else {
            setPasswordMatchError("");
        }
    }

    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Card>
                <h2 className="text-2xl text-center font-semibold mb-6 text-white">
                    Sign Up
                </h2>

                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-1">
                        <input
                            type="text"
                            placeholder="Name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="p-3 rounded-lg bg-white/20 text-white placeholder-white/60 outline-none border-l-2 border-transparent focus:border-orange-500"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            required
                            onChange={(e) => setEmail(e.target.value)}
                            className="p-3 rounded-lg bg-white/20 text-white placeholder-white/60 outline-none border-l-2 border-transparent focus:border-orange-500"
                        />
                        {emailError && (
                            <p className="text-red-400 text-sm">{emailError}</p>
                        )}
                        {loadingEmailCheck && !emailError && (
                            <p className="text-gray-300 text-sm">Checking…</p>
                        )}
                    </div>

                    <div className="relative flex flex-col gap-1">
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                required
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setPassword(val);
                                    setStrength(evaluatePasswordStrength(val));
                                    if (passwordAgain)
                                        checkPasswordMatch(passwordAgain);
                                }}
                                className="p-3 w-full rounded-lg bg-white/20 text-white placeholder-white/60 outline-none border-l-2 border-transparent focus:border-orange-500"
                            />

                            <span
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-3 cursor-pointer text-white"
                            >
                                {showPassword ? <Eye /> : <EyeClosed />}
                            </span>
                        </div>

                        <small className="text-white font-semibold ml-1">
                            Password strength:{" "}
                            <span
                                className={
                                    colors[strength.toLowerCase()] ||
                                    "text-white"
                                }
                            >
                                {strength || "—"}
                            </span>
                        </small>

                        <input
                            type="password"
                            placeholder="Confirm Password"
                            required
                            value={passwordAgain}
                            className="p-3 rounded-lg bg-white/20 text-white placeholder-white/60 outline-none border-l-2 border-transparent focus:border-orange-500"
                            onChange={(e) => {
                                setPasswordAgain(e.target.value);
                                checkPasswordMatch(e.target.value);
                            }}
                        />
                        {passwordmatcherror && (
                            <p className="text-red-500 text-sm">
                                {passwordmatcherror}
                            </p>
                        )}
                    </div>

                    <RoleSelect onChange={setRole} />

                    <div className="flex flex-col gap-1">
                        <input
                            type="text"
                            placeholder="Organisation name"
                            required
                            value={org_name}
                            onChange={(e) => setOrg_name(e.target.value)}
                            className="p-3 rounded-lg bg-white/20 text-white placeholder-white/60 outline-none border-l-2 border-transparent focus:border-orange-500"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                        type="submit"
                        className="p-3 rounded-lg bg-orange-500 hover:bg-orange-600 transition text-white font-semibold cursor-pointer"
                    >
                        Sign Up
                    </button>
                </form>

                <p className="mt-4 text-center italic font-semibold text-white/80">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="text-orange-400 hover:underline"
                    >
                        Login
                    </Link>
                </p>
            </Card>
        </div>
    );
}

export default Signup;
