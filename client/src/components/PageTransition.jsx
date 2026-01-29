import React, { useEffect, useState } from 'react';

const PageTransition = ({ children }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(false);
        const timer = setTimeout(() => setIsVisible(true), 10);
        return () => clearTimeout(timer);
    }, [children]);

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
