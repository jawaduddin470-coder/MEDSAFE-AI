import React from 'react';
import Navbar from './Navbar';
import { Phone, Instagram, Linkedin, Mail } from 'lucide-react';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0e1a] flex flex-col relative overflow-x-hidden transition-colors duration-500">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-0 dark:opacity-100 transition-opacity duration-500">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 blur-[130px] rounded-full" />
                <div className="absolute bottom-[10%] right-[-10%] w-[45%] h-[45%] bg-blue-600/10 blur-[130px] rounded-full" />
            </div>

            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8 relative z-10 transition-all duration-500">
                {children}
            </main>

            {/* ── Premium Footer ─────────────────────────────────────────────────── */}
            <footer className="relative z-10 bg-gray-50 dark:bg-gray-900/40 backdrop-blur-xl border-t border-gray-200 dark:border-white/5 mt-auto">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-12">

                        {/* Brand Section */}
                        <div className="max-w-xs">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-600 rounded-lg shadow-lg shadow-teal-500/20" />
                                <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">MedSafe AI</span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Empowering health with AI-driven medication safety and smart awareness. Your trusted companion for medical safety.
                            </p>
                        </div>

                        {/* Contact info grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full lg:max-w-2xl">
                            <ContactLink
                                href="tel:+917671958282"
                                icon={<Phone size={18} />}
                                label="Phone"
                                value="+91 76719 58282"
                                hoverClass="hover:border-blue-500 hover:bg-blue-500/5"
                            />
                            <ContactLink
                                href="https://www.instagram.com/___jawad.11__/"
                                icon={<Instagram size={18} />}
                                label="Instagram"
                                value="@___jawad.11__"
                                hoverClass="hover:border-pink-500 hover:bg-pink-500/5"
                                isExternal
                            />
                            <ContactLink
                                href="https://www.linkedin.com/in/merajuddin-0751a6396/"
                                icon={<Linkedin size={18} />}
                                label="LinkedIn"
                                value="merajuddin"
                                hoverClass="hover:border-blue-400 hover:bg-blue-400/5"
                                isExternal
                            />
                            <ContactLink
                                href="mailto:jawaduddin470@gmail.com"
                                icon={<Mail size={18} />}
                                label="Email"
                                value="jawaduddin470@gmail.com"
                                hoverClass="hover:border-teal-500 hover:bg-teal-500/5"
                            />
                        </div>
                    </div>

                    {/* Bottom disclaimer */}
                    <div className="mt-12 pt-8 border-t border-white/5 text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-medium">
                            © 2026 MedSafe AI — Developed for Safety Awareness
                        </p>
                        <p className="text-[10px] text-gray-600 max-w-2xl mx-auto italic">
                            Disclaimer: This platform is an assistive tool only and does not provide medical advice.
                            Always consult a professional healthcare provider for medical diagnosis and treatment.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const ContactLink = ({ href, icon, label, value, hoverClass, isExternal }) => (
    <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className={`group flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm transition-all duration-300 ${hoverClass}`}
    >
        <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors duration-300">
            {icon}
        </span>
        <div className="min-w-0">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</p>
            <p className="text-sm font-semibold text-gray-300 truncate">{value}</p>
        </div>
    </a>
);

export default Layout;
