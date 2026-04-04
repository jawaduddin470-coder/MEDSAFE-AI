import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setIsVisible(false);
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    return (
        <div
            className={`transition-all duration-300 ${isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2'
                }`}
        >
            {children}
        </div>
    );
};

export default PageTransition;
