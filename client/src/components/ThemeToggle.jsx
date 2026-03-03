import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-white/10 transition-all duration-300 shadow-sm dark:shadow-teal-500/5 group"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            <div className="relative w-5 h-5">
                <Sun
                    className={`absolute inset-0 transition-all duration-300 ${theme === 'light'
                        ? 'opacity-100 rotate-0 scale-100'
                        : 'opacity-0 rotate-90 scale-0'
                        }`}
                    size={20}
                />
                <Moon
                    className={`absolute inset-0 transition-all duration-300 ${theme === 'dark'
                        ? 'opacity-100 rotate-0 scale-100'
                        : 'opacity-0 -rotate-90 scale-0'
                        }`}
                    size={20}
                />
            </div>
        </button>
    );
};

export default ThemeToggle;
