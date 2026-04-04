import React from 'react';
import { Check, Info, ArrowRight, Zap, ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Pricing = () => {
    const { t } = useLanguage();

    const PLANS = [
        {
            name: t('pricing_free_name'),
            price: t('pricing_free_price'),
            period: t('pricing_free_period'),
            description: t('pricing_desc_free'),
            features: [
                t('pricing_feature_limit'),
                t('pricing_feature_alarm'),
                t('pricing_feature_ai_limit'),
                t('pricing_feature_overdose'),
            ],
            buttonText: t('pricing_cta_free'),
            isPopular: false,
            icon: <HeartPulse className="text-gray-400" size={24} />,
            color: 'from-gray-500/20 to-gray-500/5'
        },
        {
            name: t('pricing_pro_name'),
            price: t('pricing_pro_price'),
            period: t('pricing_pro_period'),
            description: t('pricing_desc_pro'),
            features: [
                t('pricing_feature_unlimit'),
                t('pricing_feature_risk'),
                t('pricing_feature_priority'),
                t('pricing_feature_report'),
                'Full OCR Scanning',
                'Advanced Safety Audit'
            ],
            buttonText: t('pricing_cta_pro'),
            isPopular: true,
            icon: <Zap className="text-indigo-500" size={24} />,
            color: 'from-indigo-500/30 to-blue-500/10'
        },
        {
            name: t('pricing_family_name'),
            price: t('pricing_family_price'),
            period: t('pricing_family_period'),
            description: t('pricing_desc_family'),
            features: [
                t('pricing_feature_pro'),
                t('pricing_feature_family_count'),
                t('pricing_feature_dash'),
                t('pricing_feature_family_risk'),
                'Unlimited Independent Profiles'
            ],
            buttonText: t('pricing_cta_family'),
            isPopular: false,
            icon: <ShieldCheck className="text-purple-500" size={24} />,
            color: 'from-purple-500/20 to-pink-500/5'
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-indigo-500/10 to-transparent blur-[120px] -z-10 opacity-30 pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] -z-10 opacity-20" />
            <div className="absolute top-1/2 right-0 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] -z-10 opacity-20" />

            <div className="text-center mb-20 relative">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6 animate-bounce">
                    <Sparkles size={12} /> {t('landing_badge_ai')}
                </div>
                <h1 className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter sm:text-7xl italic uppercase leading-tight">
                    Universal <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400">MedSafe</span> Access
                </h1>
                <p className="mt-8 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto font-medium leading-relaxed">
                    {t('pricing_subtitle')}
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-stretch lg:max-w-6xl lg:mx-auto">
                {PLANS.map((plan) => (
                    <div
                        key={plan.name}
                        className={`group glass-card rounded-[3.5rem] border-white/5 p-10 flex flex-col relative overflow-hidden transition-all duration-700 hover:-translate-y-4 hover:shadow-3xl
                            ${plan.isPopular ? 'border-indigo-500/30 ring-1 ring-indigo-500/20 shadow-2xl scale-105 z-20 bg-white/5' : 'hover:bg-white/[0.04]'}
                        `}
                    >
                        {/* Shimmer Effect */}
                        <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${plan.color} opacity-80`} />

                        <div className="mb-10 flex justify-between items-start">
                            <div className={`p-4 rounded-3xl bg-white/5 border border-white/5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700`}>
                                {plan.icon}
                            </div>
                            {plan.isPopular && (
                                <span className="px-4 py-1.5 rounded-2xl text-[10px] font-black bg-indigo-500 text-white uppercase tracking-widest shadow-lg shadow-indigo-500/30">
                                    {t('pricing_popular')}
                                </span>
                            )}
                        </div>

                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase italic">{plan.name}</h3>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-gray-900 via-gray-700 to-gray-800 dark:from-white dark:via-gray-100 dark:to-gray-400">
                                    {plan.price}
                                </span>
                                <span className="text-gray-500 dark:text-gray-500 font-black uppercase text-xs tracking-widest">{plan.period}</span>
                            </div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed italic opacity-80">{plan.description}</p>
                        </div>

                        <div className="flex-1 mb-10">
                            <ul className="space-y-5">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-4">
                                        <div className="shrink-0 mt-1">
                                            <div className={`p-1 rounded-full ${plan.isPopular ? 'bg-indigo-500' : 'bg-teal-500/20 text-teal-500'}`}>
                                                <Check className={`w-3 h-3 ${plan.isPopular ? 'text-white' : ''}`} strokeWidth={4} />
                                            </div>
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300 text-sm font-bold opacity-90">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button className={`w-full py-5 rounded-[2rem] font-black text-xs tracking-[0.2em] uppercase transition-all duration-500 flex items-center justify-center gap-3 active:scale-95
                            ${plan.isPopular
                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/40 hover:bg-indigo-500 hover:shadow-indigo-500/60'
                                : 'bg-white/5 dark:bg-white/5 text-gray-900 dark:text-white border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5'
                            }`}
                        >
                            {plan.buttonText}
                            <ArrowRight size={16} className={`transition-transform duration-300 group-hover:translate-x-1`} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-24 text-center">
                <div className="glass-card inline-flex items-center gap-6 p-2 rounded-[3rem] border-white/5 mx-auto">
                    <div className="bg-white/10 p-4 rounded-full">
                        <Info className="w-6 h-6 text-indigo-400" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 pr-8 font-medium">
                        <span className="text-gray-900 dark:text-white font-black uppercase mr-2 tracking-widest">{t('pricing_note_title')}</span>
                        {t('pricing_note_text')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
