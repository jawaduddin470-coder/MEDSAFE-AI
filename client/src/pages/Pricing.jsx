import React from 'react';
import { Check, Info, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PLANS = [
    {
        name: 'Free',
        price: '$0',
        period: 'forever',
        description: 'Basic medication safety strictly for individual use.',
        features: [
            'Up to 5 Reminders',
            'Basic alarm notifications',
            'Limited MedSuree Assistant',
            'Overdose warnings',
        ],
        buttonText: 'Current Plan',
        isPopular: false,
    },
    {
        name: 'Pro',
        price: '$9',
        period: 'per month',
        description: 'Advanced analytics and unlimited tracking for power users.',
        features: [
            'Unlimited Reminders',
            'Advanced AI Risk Analysis',
            'Priority Browser and Email Alerts',
            'Shareable Health Reports',
        ],
        buttonText: 'Upgrade to Pro',
        isPopular: true,
    },
    {
        name: 'Family',
        price: '$24',
        period: 'per month',
        description: 'Comprehensive medication tracking for your entire household.',
        features: [
            'Includes Pro features',
            'Manage up to 5 family members',
            'Shared caregiver dashboards',
            'Family risk intersection safety',
        ],
        buttonText: 'Get Family Plan',
        isPopular: false,
    }
];

const Pricing = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fadeIn">
            <div className="text-center mb-16">
                <h2 className="text-base text-teal-500 font-bold tracking-widest uppercase italic">Subscription</h2>
                <h1 className="mt-2 text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-5xl">
                    Simple, transparent pricing
                </h1>
                <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
                    Choose the safety plan that fits your life. No hidden fees. Cancel anytime.
                </p>
            </div>

            <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-3 sm:gap-6 lg:max-w-5xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
                {PLANS.map((plan) => (
                    <div
                        key={plan.name}
                        className={`glass-card rounded-[2rem] border-white/10 p-8 flex flex-col relative overflow-hidden transition-all duration-500 hover:-translate-y-2
                            ${plan.isPopular ? 'border-2 border-indigo-500 shadow-indigo-500/20 shadow-2xl scale-105 z-10' : 'hover:shadow-xl'}
                        `}
                    >
                        {plan.isPopular && (
                            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                        )}

                        <div className="mb-8">
                            {plan.isPopular && (
                                <span className="absolute top-6 right-6 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 uppercase letter-spacing-widest">
                                    Most Popular
                                </span>
                            )}
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                                    {plan.price}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 font-medium">/{plan.period}</span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                        </div>

                        <div className="flex-1">
                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="shrink-0 mt-0.5 relative">
                                            <div className="absolute inset-0 bg-teal-400 rounded-full blur-sm opacity-20"></div>
                                            <Check className="w-5 h-5 text-teal-500 relative z-10" />
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button className={`w-full py-4 rounded-xl font-bold tracking-wide uppercase transition-all duration-300 flex items-center justify-center gap-2
                            ${plan.isPopular
                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-lg shadow-indigo-500/30'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            {plan.buttonText}
                            {!plan.isPopular && <ArrowRight size={16} />}
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-16 glass-card p-6 rounded-2xl max-w-3xl mx-auto flex items-start gap-4">
                <Info className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong className="text-gray-900 dark:text-white">Note:</strong> Payment integration is currently in Test Mode. You will not be charged. All premium features are unlocked during the beta phase.
                </p>
            </div>
        </div>
    );
};

export default Pricing;
