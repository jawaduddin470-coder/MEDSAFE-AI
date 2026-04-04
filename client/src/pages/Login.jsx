import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Lock, Mail } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to login';
            setError(`${msg} (Check server console)`);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 glass-card p-12 rounded-[2.5rem] border-white/5 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary" />
            <div className="text-center mb-10">
                <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">{t('auth_login_welcome')} <span className="text-teal-400">{t('auth_login_back')}</span></h2>
                <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-4">{t('auth_login_subtitle')}</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm flex items-center justify-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">{t('auth_login_email_label')}</label>
                    <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-teal-500/40" size={18} />
                        <input
                            type="email"
                            required
                            className="input-modern pl-14 pr-6 py-4 text-gray-900 dark:text-white"
                            placeholder={t('auth_login_email_placeholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">{t('auth_login_pass_label')}</label>
                    <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-teal-500/40" size={18} />
                        <input
                            type="password"
                            required
                            className="input-modern pl-14 pr-6 py-4 text-gray-900 dark:text-white"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full btn-primary hover-glow !py-5 text-sm font-black uppercase tracking-[0.2em] mt-8"
                >
                    {t('auth_login_btn')}
                </button>
            </form>

            <p className="text-center mt-8 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                {t('auth_login_no_account')}{' '}
                <Link to="/register" className="text-teal-400 hover:text-teal-300 transition-colors">
                    {t('auth_login_register_link')}
                </Link>
            </p>
        </div>
    );
};

export default Login;
