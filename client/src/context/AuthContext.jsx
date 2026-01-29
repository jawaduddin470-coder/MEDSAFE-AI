import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Direct connection without proxy to rule out proxy issues
const API_URL = 'http://localhost:5001/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // Configure axios defaults
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    useEffect(() => {
        const checkUserLoggedIn = async () => {
            if (token) {
                try {
                    // Use direct URL
                    const { data } = await axios.get(`${API_URL}/auth/me`);
                    setUser(data);
                } catch (error) {
                    console.error("Auth check failed:", error);
                    logout();
                }
            }
            setLoading(false);
        };

        checkUserLoggedIn();
    }, [token]);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            return data;
        } catch (err) {
            console.error("Login Error:", err);
            throw err;
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await axios.post(`${API_URL}/auth/register`, { name, email, password });
            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
            return data;
        } catch (err) {
            console.error("Register Error:", err);
            throw err;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const updateSubscription = (newSubData) => {
        setUser(prev => ({ ...prev, subscription: newSubData }));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, updateSubscription }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
