import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Menu, X, Box } from "lucide-react";
import api from "../api/axios.js";

function Navbar() {
    const auth = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        const refreshToken = localStorage.getItem("refresh_token");
        try {
            await api.post("/api/auth/logout");
            auth.logout();
        } catch (err) {
            console.error("Logout error:", err);
            auth.logout();
        }
    };

    const navitems = (
        <ul className="flex flex-row gap-6">
            {auth.isAuthenticated ? (
                <>
                    <li>
                        <NavLink
                            to="/dashboard"
                            onClick={(isOpen) => setIsOpen(!isOpen)}
                            className={({ isActive }) =>
                                `text-semibold italic ${isActive ? "text-orange-400" : "text-white"}`
                            }
                        >
                            Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <button
                            onClick={(isOpen) => {
                                handleLogout();
                                setIsOpen(!isOpen);
                            }}
                            className="text-semibold italic text-white hover:text-orange-400 cursor-pointer"
                        >
                            Logout
                        </button>
                    </li>
                </>
            ) : (
                <>
                    <li>
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                `text-semibold italic ${isActive ? "text-orange-400" : "text-white"}`
                            }
                            onClick={(isOpen) => setIsOpen(!isOpen)}
                        >
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/login"
                            onClick={(isOpen) => setIsOpen(!isOpen)}
                            className={({ isActive }) =>
                                `text-semibold italic ${isActive ? "text-orange-400" : "text-white"}`
                            }
                        >
                            Login
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/signup"
                            onClick={(isOpen) => setIsOpen(!isOpen)}
                            className={({ isActive }) =>
                                `text-semibold italic ${isActive ? "text-orange-400" : "text-white"}`
                            }
                        >
                            Signup
                        </NavLink>
                    </li>
                </>
            )}
        </ul>
    );

    return (
        <nav className="sticky top-0 h-12 z-50 m-4 bg-white/20 backdrop-blur-md shadow-lg flex flex-row px-4 py-4 justify-between items-center rounded-2xl">
            <NavLink
                to="/"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
                <Box className="w-6 h-6 text-orange-400" />
                <h1 className="text-white text-xl font-bold">TradeChain</h1>
            </NavLink>
            <ul className="hidden md:flex flex-row gap-6">
                <li>
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `text-semibold italic ${isActive ? "text-orange-400" : "text-white"}`
                        }
                    >
                        Home
                    </NavLink>
                </li>
                {auth.isAuthenticated ? (
                    <>
                        <li>
                            <NavLink
                                to="/dashboard"
                                className={({ isActive }) =>
                                    `text-semibold italic ${isActive ? "text-orange-400" : "text-white"}`
                                }
                            >
                                Dashboard
                            </NavLink>
                        </li>
                        <li>
                            <button
                                onClick={() => {
                                    handleLogout();
                                }}
                                className="text-semibold italic text-white hover:text-orange-400 cursor-pointer"
                            >
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <NavLink
                                to="/login"
                                className={({ isActive }) =>
                                    `text-semibold italic ${isActive ? "text-orange-400" : "text-white"}`
                                }
                            >
                                Login
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to="/signup"
                                className={({ isActive }) =>
                                    `text-semibold italic ${isActive ? "text-orange-400" : "text-white"}`
                                }
                            >
                                Signup
                            </NavLink>
                        </li>
                    </>
                )}
            </ul>

            <div className="md:hidden">
                <button
                    onClick={() => setIsOpen((s) => !s)}
                    aria-expanded={isOpen}
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                    className="p-2 rounded-md text-white hover:text-orange-400"
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {isOpen && (
                <div className="absolute top-16 right-0 bg-white/20 backdrop-blur-md shadow-lg rounded-2xl p-4 flex flex-col gap-4 md:hidden">
                    {navitems}
                </div>
            )}
        </nav>
    );
}

export default Navbar;
