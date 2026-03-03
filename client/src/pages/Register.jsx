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
        <div className="max-w-md mx-auto mt-16 glass-card p-12 rounded-[2.5rem] border-white/5 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary" />
            <div className="text-center mb-10">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">Join <span className="text-teal-400">Medsafe</span></h2>
                <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-4">Initialize Health Protocol</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm flex items-center justify-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Full Identity</label>
                    <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-teal-500/40" size={18} />
                        <input
                            type="text"
                            required
                            className="input-modern pl-14 pr-6 py-4"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-teal-500/40" size={18} />
                        <input
                            type="email"
                            required
                            className="input-modern pl-14 pr-6 py-4"
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Access Key</label>
                    <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-teal-500/40" size={18} />
                        <input
                            type="password"
                            required
                            className="input-modern pl-14 pr-6 py-4"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full btn-primary !py-5 text-sm font-black uppercase tracking-[0.2em] mt-4"
                >
                    Create Identity
                </button>
            </form>

            <p className="text-center mt-8 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                Already registered?{' '}
                <Link to="/login" className="text-teal-400 hover:text-teal-300 transition-colors">
                    Authenticate
                </Link>
            </p>
        </div>
    );
};

export default Register;
