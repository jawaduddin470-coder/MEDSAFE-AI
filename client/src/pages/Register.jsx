import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to register';
            setError(`${msg} (Check server console)`);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-2xl shadow-soft border border-gray-100">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Get Started</h2>
                <p className="text-gray-500 mt-2">Create your account to start managing risks</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm flex items-center justify-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="email"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="password"
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all"
                >
                    Create Account
                </button>
            </form>

            <p className="text-center mt-6 text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-bold hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    );
};

export default Register;
