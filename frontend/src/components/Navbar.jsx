import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { Menu, X, Box } from "lucide-react";

function Navbar() {
    const { logout, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const handleLinkClick = () => setIsOpen(false);

    const navitems = (
        <ul className="flex flex-row gap-6">
            {isAuthenticated ? (
                <>
                    <li>
                        <NavLink
                            to="/dashboard"
                            onClick={handleLinkClick}
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
                                logout();
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
                            onClick={handleLinkClick}
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
                            onClick={handleLinkClick}
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
            <ul className="hidden md:flex flex-row gap-6">{navitems}</ul>

            <div className="block md:hidden">
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
