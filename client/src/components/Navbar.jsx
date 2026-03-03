import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ShieldAlert, LogOut, User, Bell, ChevronRight, MessageCircle } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Dynamic glass effect on scroll
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsOpen(false);
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        ...(user ? [
            { name: 'Dashboard', path: '/dashboard' },
            { name: 'Reminders', path: '/reminders', icon: <Bell size={14} /> },
            { name: 'My Meds', path: '/medications' },
            { name: 'Family', path: '/family' },
            { name: 'Check Risks', path: '/analysis' },
            { name: 'AI Assistant', path: '#', onClick: () => { window.dispatchEvent(new CustomEvent('toggle-assistant')); setIsOpen(false); }, icon: <MessageCircle size={14} />, mobileOnly: true },
        ] : [])
    ];

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
            ? 'py-3 bg-gray-900/70 backdrop-blur-xl border-b border-white/5 shadow-2xl'
            : 'py-5 bg-transparent border-b border-transparent'
            }`}>
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-12">

                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group transition-transform duration-300 hover:scale-105">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                            <ShieldAlert size={32} className="text-indigo-600 dark:text-indigo-400 relative z-10" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white uppercase italic">
                            MedSafe<span className="bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent">AI</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`nav-link-modern flex items-center gap-1.5 ${location.pathname === link.path ? 'text-indigo-600 dark:text-indigo-400 after:w-1/2 after:opacity-100' : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white'
                                    } ${link.mobileOnly ? 'hidden' : ''}`}
                            >
                                {link.icon}
                                {link.name}
                            </Link>
                        ))}

                        <div className="h-6 w-[1px] bg-white/10 mx-4" />

                        <ThemeToggle />

                        {user ? (
                            <div className="flex items-center gap-4 ml-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                                    <User size={16} className="text-teal-500" />
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{user.name}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-red-400 bg-white/5 border border-white/10 rounded-lg hover:border-red-500/30 transition-all duration-300"
                                    title="Logout"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 ml-4">
                                <Link to="/login" className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-white transition-colors">Login</Link>
                                <Link to="/register" className="btn-primary flex items-center gap-2 !py-2 !px-5 text-sm">
                                    Get Started <ChevronRight size={16} />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <div className="lg:hidden flex items-center space-x-4">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 transition-colors"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`lg:hidden fixed inset-x-0 top-[100%] transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible'
                }`}>
                <div className="mx-4 mt-2 p-6 rounded-3xl glass-card border border-white/10 shadow-3xl space-y-6">
                    <div className="flex flex-col space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`flex items-center justify-between p-4 rounded-2xl transition-all ${location.pathname === link.path
                                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/5 active:bg-indigo-500/5'
                                    }`}
                                onClick={(e) => {
                                    if (link.onClick) {
                                        e.preventDefault();
                                        link.onClick();
                                    } else {
                                        setIsOpen(false);
                                    }
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    {link.icon || <ChevronRight size={14} className="opacity-50" />}
                                    <span className="font-bold uppercase tracking-wider text-xs">{link.name}</span>
                                </div>
                                <ChevronRight size={18} className="opacity-50" />
                            </Link>
                        ))}
                    </div>

                    {user ? (
                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center">
                                    <User size={20} className="text-teal-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{user.name}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Pro Member</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all shadow-lg shadow-red-500/5"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 pt-4">
                            <Link to="/login" className="btn-secondary text-center" onClick={() => setIsOpen(false)}>Login</Link>
                            <Link to="/register" className="btn-primary text-center" onClick={() => setIsOpen(false)}>Get Started</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
