import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Activity, List, AlertTriangle, Shield, CreditCard } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
    const { user, updateSubscription } = useAuth();
    const [subscribing, setSubscribing] = useState(false);

    const handleSubscribe = async (plan) => {
        setSubscribing(true);
        try {
            const { data } = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/subscription`, { plan });
            updateSubscription(data.subscription);
            alert(`Successfully upgraded to ${plan} plan!`);
        } catch (err) {
            console.error(err);
        } finally {
            setSubscribing(false);
        }
    }

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Hello, {user?.name.split(' ')[0]} 👋</h1>
                <p className="opacity-90">Welcome to your medication safety command center.</p>

                <div className="mt-6 flex flex-wrap gap-3">
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium flex items-center">
                        <Shield size={16} className="mr-2" /> Plan: {user?.subscription?.plan.replace('_', ' ').toUpperCase()}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <Activity className="mr-2 text-primary" /> Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link to="/medications" className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-center">
                            <Plus className="text-blue-600 mb-2" size={24} />
                            <span className="font-medium text-blue-900">Add Meds</span>
                        </Link>
                        <Link to="/analysis" className="flex flex-col items-center justify-center p-4 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors text-center">
                            <AlertTriangle className="text-teal-600 mb-2" size={24} />
                            <span className="font-medium text-teal-900">Check Risks</span>
                        </Link>
                    </div>
                </div>

                {/* Upgrade Plan */}
                <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <CreditCard className="mr-2 text-accent" /> Upgrade Plan
                    </h2>
                    <div className="space-y-3">
                        {['1_month', '3_months', '6_months'].map((plan) => (
                            <button
                                key={plan}
                                disabled={subscribing || user?.subscription?.plan === plan}
                                onClick={() => handleSubscribe(plan)}
                                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium border transition-all flex justify-between items-center ${user?.subscription?.plan === plan
                                    ? 'bg-green-50 border-green-200 text-green-700'
                                    : 'bg-gray-50 border-transparent hover:bg-gray-100 text-gray-700'
                                    }`}
                            >
                                <span>{plan.replace('_', ' ').toUpperCase()} Plan</span>
                                {user?.subscription?.plan === plan && <span className="text-xs bg-green-200 px-2 py-1 rounded-full">Active</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
