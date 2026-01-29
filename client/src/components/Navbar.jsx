import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Pill, ShieldAlert, LogOut, User } from 'lucide-react';
import clsx from 'clsx';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-soft sticky top-0 z-50 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 text-primary dark:text-blue-400">
                        <ShieldAlert size={28} />
                        <span className="text-xl font-heading font-bold text-gray-800 dark:text-gray-100">MedSafe<span className="text-primary dark:text-blue-400">AI</span></span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/" className="nav-link">Home</Link>
                        <Link to="/about" className="nav-link">About</Link>
                        {user ? (
                            <>
                                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                                <Link to="/medications" className="nav-link">My Meds</Link>
                                <Link to="/family" className="nav-link">Family</Link>
                                <Link to="/analysis" className="nav-link">Check Risks</Link>
                                <ThemeToggle />
                                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                                        <User size={16} className="mr-1" /> {user.name}
                                    </span>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
                                    >
                                        <LogOut size={16} className="mr-1" /> Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="font-medium text-primary dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">Login</Link>
                                <ThemeToggle />
                                <Link to="/register" className="bg-primary hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-lg shadow-blue-500/30">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <div className="md:hidden flex items-center space-x-2">
                        <ThemeToggle />
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 dark:text-gray-300 p-2">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-4 py-4 space-y-4 animate-in slide-in-from-top duration-300">
                    <Link to="/" className="block text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 transition-colors" onClick={() => setIsOpen(false)}>Home</Link>
                    <Link to="/about" className="block text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 transition-colors" onClick={() => setIsOpen(false)}>About</Link>
                    {user ? (
                        <>
                            <Link to="/dashboard" className="block text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 transition-colors" onClick={() => setIsOpen(false)}>Dashboard</Link>
                            <Link to="/medications" className="block text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 transition-colors" onClick={() => setIsOpen(false)}>My Meds</Link>
                            <Link to="/family" className="block text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 transition-colors" onClick={() => setIsOpen(false)}>Family</Link>
                            <Link to="/analysis" className="block text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 transition-colors" onClick={() => setIsOpen(false)}>Check Risks</Link>
                            <button onClick={handleLogout} className="block w-full text-left text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="block text-primary dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors" onClick={() => setIsOpen(false)}>Login</Link>
                            <Link to="/register" className="block text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 transition-colors" onClick={() => setIsOpen(false)}>Register</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
