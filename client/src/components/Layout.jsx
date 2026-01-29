import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-background dark:bg-gray-900 font-body text-text dark:text-gray-100 transition-colors duration-300">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                {children}
            </main>
            <footer className="bg-white border-t border-gray-100 py-6 mt-12">
                <div className="container mx-auto px-4 text-center text-muted text-sm">
                    <p>© 2026 MedSafe AI. Assistive Tool Only. Not Medical Advice.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
