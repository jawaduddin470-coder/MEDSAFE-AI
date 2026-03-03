import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Activity, AlertTriangle, Shield, Bell, CheckCircle, Clock, AlertCircle, ArrowRight, ChevronRight } from 'lucide-react';
import { useReminders, getStatus } from '../context/ReminderContext';

const Dashboard = () => {
    const { user } = useAuth();
    const { reminders, stats } = useReminders();

    // Upcoming reminders sorted by soonest
    const upcomingReminders = reminders
        .filter((r) => getStatus(r) === 'upcoming')
        .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
        .slice(0, 3);

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            {/* Hero */}
            {/* Hero */}
            <div className="relative overflow-hidden rounded-[2rem] p-10 text-white shadow-2xl border border-white/10 group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 via-blue-700/90 to-indigo-900/90 opacity-95 transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight uppercase italic">Hello, {user?.name?.split(' ')[0]} 👋</h1>
                        <p className="text-indigo-100 font-medium opacity-80 text-lg uppercase tracking-wider">Health Intelligence Synced</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <div className="bg-black/20 backdrop-blur-md px-5 py-2 rounded-2xl text-sm font-bold flex items-center border border-white/10">
                            <Shield size={18} className="mr-2 text-teal-300" />
                            {user?.subscription?.plan
                                ? user.subscription.plan.toUpperCase()
                                : 'FREE ACCOUNT'}
                        </div>
                        {stats.upcoming > 0 && (
                            <div className="bg-white text-indigo-600 px-5 py-2 rounded-2xl text-sm font-black flex items-center shadow-lg shadow-black/20 uppercase tracking-widest">
                                <Bell size={18} className="mr-2 animate-bounce" />
                                {stats.upcoming} PENDING
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Reminder Summary ─────────────────────────── */}
            <div className="glass-card rounded-[2rem] p-8 border-white/5 shadow-3xl">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight uppercase italic">
                        <Bell size={24} className="text-indigo-500" /> NEURAL REMINDERS
                    </h2>
                    <Link to="/reminders" className="btn-secondary !py-2 !px-5 text-sm flex items-center gap-2 group">
                        Manage <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    <StatBox count={stats.upcoming} label="Upcoming" icon={<Clock size={20} />} color="indigo" />
                    <StatBox count={stats.completed} label="Taken" icon={<CheckCircle size={20} />} color="green" />
                    <StatBox count={stats.missed} label="Missed" icon={<AlertCircle size={20} />} color="red" />
                </div>

                {/* Next 3 upcoming */}
                {upcomingReminders.length > 0 ? (
                    <div className="grid gap-4">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Priority Queue</p>
                        {upcomingReminders.map((r) => {
                            const dt = new Date(`${r.date}T${r.time}`);
                            return (
                                <div key={r.id} className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-2xl transition-all duration-300 hover:bg-white/10 hover:border-teal-500/30 group/item hover:-translate-y-1">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover/item:scale-110 transition-transform border border-indigo-500/20">
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-lg uppercase italic">{r.medicineName}</p>
                                            {r.dosage && <p className="text-xs text-gray-600 dark:text-gray-500 font-bold uppercase tracking-wider">{r.dosage}</p>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                                            {dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                                            {dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 glass-card rounded-2xl border-white/5">
                        <p className="text-gray-500 font-medium mb-4 italic">No pending medications for today.</p>
                        <Link to="/reminders" className="text-teal-400 font-bold hover:text-teal-300 transition-colors uppercase tracking-widest text-xs">Schedule Now →</Link>
                    </div>
                )}
            </div>

            {/* ── Quick Actions ────────────────────────────── */}
            <div className="glass-card rounded-[2rem] p-8 border-white/5">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3 tracking-tight uppercase italic">
                    <Activity className="text-indigo-500" size={24} /> CORE INTERFACE
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <ActionCard to="/reminders" icon={<Bell size={28} />} label="Reminders" color="blue" />
                    <ActionCard to="/medications" icon={<Plus size={28} />} label="Inventory" color="indigo" />
                    <ActionCard to="/analysis" icon={<AlertTriangle size={28} />} label="Risk Scan" color="amber" />
                    <ActionCard to="/family" icon={<CheckCircle size={28} />} label="Family Hub" color="purple" />
                </div>
            </div>
        </div>
    );
};

const StatBox = ({ count, label, icon, color }) => {
    const colorClasses = {
        indigo: 'text-indigo-400 hover:border-indigo-500/30',
        green: 'text-emerald-400 hover:border-emerald-500/30',
        red: 'text-rose-400 hover:border-rose-500/30',
        blue: 'text-blue-400 hover:border-blue-500/30',
    };

    return (
        <div className={`p-6 rounded-2xl bg-white/5 border border-white/5 transition-all duration-300 hover:bg-white/10 group hover:-translate-y-1 ${colorClasses[color] || 'text-gray-400'}`}>
            <div className="mb-3 group-hover:scale-110 transition-transform">{icon}</div>
            <p className="text-3xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">{count}</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{label}</p>
        </div>
    );
};

const ActionCard = ({ to, icon, label, color }) => {
    const colorClasses = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40',
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/40',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40',
    };

    return (
        <Link to={to} className={`flex flex-col items-center justify-center p-8 rounded-3xl border backdrop-blur-sm transition-all duration-500 group shadow-lg hover:shadow-2xl hover:-translate-y-2 ${colorClasses[color]}`}>
            <div className="mb-4 transform group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">{icon}</div>
            <span className="font-bold text-sm tracking-tight">{label}</span>
        </Link>
    );
};

export default Dashboard;
