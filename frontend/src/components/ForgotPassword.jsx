import { useState, useEffect } from "react";
import api from "../api/axios.js";
import Card from "./ui/Card.jsx";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState(
        localStorage.getItem("reset_email") || ""
    );
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [step, setStep] = useState("EMAIL");
    // EMAIL → OTP → RESET

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (email) {
            localStorage.setItem("reset_email", email);
        }
    }, [email]);

    // ---------------- SEND OTP ----------------
    async function handleSendOtp(e) {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/api/auth/forgotpassword", { email: email });
            toast.success("OTP sent to your email!");
            setStep("OTP");
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                    "Failed to send OTP. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    // ---------------- VERIFY OTP ----------------
    async function handleVerifyOtp(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const reset_email = localStorage.getItem("reset_email");
            await api.post(
                `/api/auth/verify-otp?email=${reset_email}&otp=${otp}`,
                {}
            );
            toast.success("OTP verified successfully!");
            setStep("RESET");
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Invalid OTP. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    // ---------------- RESET PASSWORD ----------------
    async function handleResetPassword(e) {
        e.preventDefault();
        const reset_email = localStorage.getItem("reset_email");
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await api.post(
                `/api/auth/reset-password?email=${reset_email}&new_password=${newPassword}`,
                {}
            );
            toast.success("Password updated successfully!");
            localStorage.removeItem("reset_email");
            navigate("/login");
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                    "Failed to reset password. Try again."
            );
        } finally {
            setLoading(false);
        }
    }

    const children = (
        <>
            <h2 className="text-2xl font-bold mb-4 text-white">
                Forgot Password
            </h2>

            {/* -------- EMAIL STEP -------- */}
            {step === "EMAIL" && (
                <form className="flex flex-col gap-4" onSubmit={handleSendOtp}>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        required
                        onChange={(e) => setEmail(e.target.value)}
                        className="p-3 rounded-lg bg-white/20 text-white placeholder-white/60 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="p-3 rounded-lg bg-orange-500 hover:bg-orange-600 transition text-white font-semibold"
                    >
                        {loading ? "Sending..." : "Send OTP"}
                    </button>
                </form>
            )}

            {/* -------- OTP STEP -------- */}
            {step === "OTP" && (
                <form
                    className="flex flex-col gap-4 mt-4"
                    onSubmit={handleVerifyOtp}
                >
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        required
                        onChange={(e) => setOtp(e.target.value)}
                        className="p-3 rounded-lg bg-white/20 text-white placeholder-white/60 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="p-3 rounded-lg bg-orange-500 hover:bg-orange-600 transition text-white font-semibold"
                    >
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                </form>
            )}

            {/* -------- RESET PASSWORD STEP -------- */}
            {step === "RESET" && (
                <form
                    className="flex flex-col gap-4 mt-4"
                    onSubmit={handleResetPassword}
                >
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        required
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="p-3 rounded-lg bg-white/20 text-white placeholder-white/60 outline-none"
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        required
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="p-3 rounded-lg bg-white/20 text-white placeholder-white/60 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="p-3 rounded-lg bg-green-500 hover:bg-green-600 transition text-white font-semibold"
                    >
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            )}
        </>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-transparent">
            <Card>{children}</Card>
        </div>
    );
}
