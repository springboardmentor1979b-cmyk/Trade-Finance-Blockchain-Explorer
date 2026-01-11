import Card from "./ui/Card.jsx";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import { Eye, EyeClosed } from "lucide-react";
import toast from "react-hot-toast";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const auth = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        try {
            const response = await api.post("/api/auth/login", {
                email: email,
                password: password,
            });
            toast.success("Login successful!");
            await auth.login(response.data, response.data.user);
        } catch (err) {
            setError(
                err.response?.data?.message || "Login failed. Please try again."
            );
        } finally {
            setPassword("");
        }
    };

    const children = (
        <>
            <h2 className="text-2xl text-center font-semibold mb-6 text-white">
                Login
            </h2>

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="p-3 rounded-lg bg-white/20 text-white placeholder-white/60 outline-none"
                />
                <div className="relative flex items-center">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        required
                        onChange={(e) => setPassword(e.target.value)}
                        className="p-3 rounded-lg bg-white/20 text-white placeholder-white/60 outline-none w-full"
                    />

                    <span
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 cursor-pointer text-white"
                    >
                        {showPassword ? <Eye /> : <EyeClosed />}
                    </span>
                </div>
                <p className="text-right">
                    <Link
                        to="/forgotpassword"
                        className="text-sm text-white/80 hover:underline hover:text-orange-500"
                    >
                        Forgot Password?
                    </Link>
                </p>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    type="submit"
                    className="p-3 rounded-lg bg-orange-500 hover:bg-orange-600 transition text-white font-semibold cursor-pointer"
                >
                    Login
                </button>
            </form>
            <p className="mt-4 text-center italic font-semibold text-white/80">
                Don't have an account?{" "}
                <Link to="/signup" className="text-orange-400 hover:underline">
                    Sign Up
                </Link>
            </p>
        </>
    );

    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Card children={children} />
        </div>
    );
}

export default Login;
