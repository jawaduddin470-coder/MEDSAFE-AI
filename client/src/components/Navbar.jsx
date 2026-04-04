import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Menu, X, ShieldAlert, LogOut, User, Bell, ChevronRight, MessageCircle, Globe, ScanLine, FlaskConical } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const LangDropdown = () => {
    const { t, lang, changeLanguage, currentLang, SUPPORTED_LANGUAGES } = useLanguage();
    const [langOpen, setLangOpen] = useState(false);
    const langRef = useRef(null);

    // Close lang dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (langRef.current && !langRef.current.contains(e.target)) {
                setLangOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={langRef} className="relative" dir="ltr">
            <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-white hover:border-indigo-500/30 transition-all duration-300 text-sm font-bold"
                title={t('nav_language')}
                aria-label="Language selector"
            >
                <Globe size={15} className="text-indigo-400" />
                <span className="hidden sm:inline uppercase tracking-wider text-xs">{currentLang.code.toUpperCase()}</span>
                <ChevronRight size={12} className={`transition-transform ${langOpen ? 'rotate-90' : ''}`} />
            </button>

            {langOpen && (
                <div className="absolute right-0 mt-2 w-44 py-2 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-2xl shadow-black/20 z-[99] animate-fade-in" dir="ltr">
                    {SUPPORTED_LANGUAGES.map((l) => (
                        <button
                            key={l.code}
                            onClick={() => { changeLanguage(l.code); setLangOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-colors ${lang === l.code
                                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10'
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                                }`}
                            dir={l.dir}
                        >
                            <span className="font-bold text-sm tracking-wide">{l.name}</span>
                            {lang === l.code && <span className="ml-auto text-indigo-500">✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Navbar = () => {
    const { user, logout } = useAuth();
    const { t, lang, changeLanguage, currentLang, SUPPORTED_LANGUAGES } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setScrolled(window.scrollY > 20);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsOpen(false);
    };

    const navLinks = [
        { key: 'home', name: t('nav_home'), path: '/' },
        { key: 'pricing', name: t('nav_pricing'), path: '/pricing' },
        { key: 'about', name: t('nav_about'), path: '/about' },
        ...(user ? [
            { key: 'dashboard', name: t('nav_dashboard'), path: '/dashboard' },
            { key: 'reminders', name: t('nav_reminders'), path: '/reminders', icon: <Bell size={14} /> },
            { key: 'myMeds', name: t('nav_myMeds'), path: '/medications' },
            { key: 'family', name: t('nav_family'), path: '/family' },
            { key: 'checkRisk', name: t('nav_checkRisk'), path: '/analysis' },
            { key: 'prescriptionScan', name: t('nav_prescriptionScan'), path: '/prescription-scan', icon: <ScanLine size={14} /> },
            { key: 'diagnostics', name: t('nav_diagnostics') || 'Diagnostics', path: '/diagnostics', icon: <FlaskConical size={14} /> },
            {
                key: 'aiAssistant',
                name: t('nav_aiAssistant'),
                path: '#',
                onClick: () => { window.dispatchEvent(new CustomEvent('toggle-assistant')); setIsOpen(false); },
                icon: <MessageCircle size={14} />,
                mobileOnly: true
            },
        ] : [])
    ];

    // LangDropdown moved outside

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
                        <div>
                            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white uppercase italic">
                                Med<span className="bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent">Suree</span>
                            </span>
                            <p className="text-[9px] text-gray-500 dark:text-gray-400 font-bold tracking-widest uppercase -mt-1 hidden sm:block">
                                {t('landing_badge')}
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            !link.mobileOnly && (
                                <Link
                                    key={link.key}
                                    to={link.path}
                                    onClick={link.onClick ? (e) => { e.preventDefault(); link.onClick(); } : undefined}
                                    className={`nav-link-modern flex items-center gap-1.5 ${location.pathname === link.path
                                        ? 'text-indigo-600 dark:text-indigo-400 after:w-1/2 after:opacity-100'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white'
                                        }`}
                                >
                                    {link.icon}
                                    {link.name}
                                </Link>
                            )
                        ))}

                        <div className="h-6 w-[1px] bg-white/10 mx-3" />

                        <LangDropdown />
                        <ThemeToggle />

                        {user ? (
                            <div className="flex items-center gap-3 ml-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                                    <User size={16} className="text-teal-500" />
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{user.name}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-red-400 bg-white/5 border border-white/10 rounded-lg hover:border-red-500/30 transition-all duration-300"
                                    title={t('nav_logout')}
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 ml-3">
                                <Link to="/login" className="text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-white transition-colors">{t('nav_login')}</Link>
                                <Link to="/register" className="btn-primary hover-glow flex items-center gap-2 !py-2 !px-5 text-sm">
                                    {t('nav_getStarted')} <ChevronRight size={16} />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <div className="lg:hidden flex items-center space-x-3">
                        <LangDropdown />
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-700 dark:text-gray-300 transition-colors"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`lg:hidden fixed inset-x-0 top-[100%] transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible'}`}>
                <div className="mx-4 mt-2 p-6 rounded-3xl glass-card border border-white/10 shadow-3xl space-y-6">
                    <div className="flex flex-col space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.key}
                                to={link.path}
                                className={`flex items-center justify-between p-4 rounded-2xl transition-all ${location.pathname === link.path
                                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-white/5'}`}
                                onClick={(e) => {
                                    if (link.onClick) { e.preventDefault(); link.onClick(); }
                                    else setIsOpen(false);
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
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                        {user?.subscription?.plan?.toUpperCase() || 'FREE PLAN'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 pt-4">
                            <Link to="/login" className="btn-secondary hover-glow text-center" onClick={() => setIsOpen(false)}>{t('nav_login')}</Link>
                            <Link to="/register" className="btn-primary hover-glow text-center" onClick={() => setIsOpen(false)}>{t('nav_getStarted')}</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
