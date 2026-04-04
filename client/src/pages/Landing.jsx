import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Activity, Users, AlertTriangle, ArrowRight, Bell, Download, Globe } from 'lucide-react';

const Landing = () => {
    const { t } = useLanguage();
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstall, setShowInstall] = useState(false);

    // PWA install prompt capture
    React.useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstall(true);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') setShowInstall(false);
        setDeferredPrompt(null);
    };

    return (
        <div className="space-y-24 pb-20">
            {/* Hero Section */}
            <section className="text-center space-y-10 py-16 md:py-32 relative overflow-hidden flex flex-col items-center justify-center min-h-[85vh]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-teal-500/10 blur-[150px] pointer-events-none rounded-full" />
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />

                <div className="relative z-10 inline-flex items-center bg-white/40 dark:bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest backdrop-blur-md animate-slide-up shadow-sm">
                    <Activity size={16} className="mr-2 animate-pulse" />
                    {t('landing_badge')}
                </div>

                <h1 className="relative z-10 text-6xl md:text-8xl lg:text-[7rem] font-black tracking-tighter text-gray-900 dark:text-white leading-[1.05] animate-slide-up [animation-delay:100ms] drop-shadow-sm">
                    {t('landing_hero1')} <br />
                    <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400 bg-clip-text text-transparent drop-shadow-sm">
                        {t('landing_hero2')}
                    </span>
                </h1>

                <p className="relative z-10 text-lg md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed animate-fade-in [animation-delay:300ms] font-medium">
                    {t('landing_subtitle')}
                </p>

                <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-5 mt-8 animate-fade-in [animation-delay:500ms] flex-wrap">
                    <Link to="/register" className="btn-primary hover-glow !px-10 !py-4 text-lg md:text-xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20">
                        {t('landing_cta_primary')} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/login" className="btn-secondary hover-glow !px-10 !py-4 text-lg md:text-xl flex items-center justify-center">
                        {t('landing_cta_secondary')}
                    </Link>
                    {showInstall && (
                        <button
                            onClick={handleInstall}
                            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400 font-bold text-lg hover:bg-teal-500/20 transition-all"
                        >
                            <Download size={20} /> {t('landing_install_btn')}
                        </button>
                    )}
                </div>

                {/* Trust badges */}
                <div className="relative z-10 flex flex-wrap justify-center gap-6 mt-4 animate-fade-in [animation-delay:700ms]">
                    {[
                        { key: 'landing_badge_ai' },
                        { key: 'landing_badge_inter' },
                        { key: 'landing_badge_family' },
                        { key: 'landing_badge_multi' }
                    ].map(badge => (
                        <span key={badge.key} className="text-xs font-bold text-gray-500 dark:text-gray-500 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block" />
                            {t(badge.key)}
                        </span>
                    ))}
                </div>
            </section>

            {/* Features Grid */}
            <section className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                <FeatureCard
                    icon={<Bell className="text-blue-500" size={36} />}
                    title={t('landing_feature_reminders')}
                    description={t('landing_feature_reminders_desc')}
                    badge="New"
                />
                <FeatureCard
                    icon={<ShieldCheck className="text-teal-500" size={36} />}
                    title={t('landing_feature_interaction')}
                    description={t('landing_feature_interaction_desc')}
                />
                <FeatureCard
                    icon={<Users className="text-purple-500" size={36} />}
                    title={t('landing_feature_family')}
                    description={t('landing_feature_family_desc')}
                />
                <FeatureCard
                    icon={<Activity className="text-pink-500" size={36} />}
                    title={t('landing_feature_risk')}
                    description={t('landing_feature_risk_desc')}
                />
                <FeatureCard
                    icon={<Globe className="text-indigo-500" size={36} />}
                    title={t('landing_feature_i18n')}
                    description={t('landing_feature_i18n_desc')}
                />
            </section>

            {/* Stat highlights */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { value: '4', label: t('landing_stat1_label'), sub: t('landing_stat1_sub') },
                    { value: '10+', label: t('landing_stat2_label'), sub: t('landing_stat2_sub') },
                    { value: '100%', label: t('landing_stat3_label'), sub: t('landing_stat3_sub') },
                    { value: 'AI', label: t('landing_stat4_label'), sub: t('landing_stat4_sub') },
                ].map(stat => (
                    <div key={stat.label} className="card-premium hover-glow text-center group">
                        <p className="text-4xl font-black bg-gradient-to-r from-indigo-500 to-teal-400 bg-clip-text text-transparent mb-1">{stat.value}</p>
                        <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm">{stat.label}</p>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{stat.sub}</p>
                    </div>
                ))}
            </section>

            {/* Multilingual Support - UNIQUE FEATURE */}
            <section className="relative overflow-hidden rounded-[3rem] p-12 bg-gradient-to-br from-indigo-600/20 via-blue-700/10 to-transparent border border-indigo-500/20 shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Globe size={120} className="text-indigo-400 animate-pulse" />
                </div>
                <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                            <ShieldCheck size={14} /> Unique Feature
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight uppercase italic tracking-tighter">
                            {t('landing_i18n_title')}
                        </h2>
                        <p className="text-xl font-bold text-gray-700 dark:text-gray-200 italic">
                            "{t('landing_i18n_subtitle')}"
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                            {t('landing_i18n_desc')}
                        </p>
                        <div className="flex gap-4 pt-4">
                            {['English', 'हिंदी', 'اردو', 'తెలుగు'].map(lang => (
                                <span key={lang} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                    {lang}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-square bg-gradient-to-tr from-indigo-500/20 to-teal-500/20 rounded-full blur-[80px] absolute inset-0 animate-pulse" />
                        <div className="relative glass-card p-8 rounded-[2rem] border-white/10 shadow-3xl text-center space-y-4">
                            <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-500 flex items-center justify-center shadow-indigo-500/40 shadow-xl">
                                <Globe size={40} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase">No Barriers</h3>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">AI Interpretation in your native language</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Medical Disclaimer */}
            <section className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-6 rounded-r-lg shadow-sm">
                <div className="flex items-start">
                    <AlertTriangle className="text-amber-600 dark:text-amber-400 min-w-[24px] mr-4 mt-1" />
                    <div>
                        <h3 className="text-amber-800 dark:text-amber-300 font-bold text-lg mb-1">{t('landing_disclaimer_title')}</h3>
                        <p className="text-amber-700 dark:text-amber-400 text-sm leading-relaxed">{t('landing_disclaimer_text')}</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, badge }) => (
    <div className="card-premium hover-glow relative group h-full">
        {badge && (
            <span className="absolute top-4 right-4 bg-teal-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter transition-transform group-hover:scale-110">
                {badge}
            </span>
        )}
        <div className="mb-6 bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:bg-teal-500/20 group-hover:scale-110 shadow-lg">
            <div className="transition-transform duration-500 group-hover:rotate-[360deg] text-teal-400 group-hover:text-teal-300">
                {icon}
            </div>
        </div>
        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-teal-400 transition-colors uppercase tracking-tight">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm group-hover:text-gray-900 dark:text-white dark:group-hover:text-gray-300">{description}</p>
    </div>
);

export default Landing;
