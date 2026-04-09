import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Pill, Clock, AlertTriangle, Shield, CheckCircle, Bell, Users, Plus, ChevronRight, TrendingUp, TrendingDown, Loader2, Camera, AlertCircle, Activity } from 'lucide-react';
import { useReminders, getStatus } from '../context/ReminderContext';
import { useLanguage } from '../context/LanguageContext';
import AdherenceChart from '../components/AdherenceChart';
import axios from 'axios';
import { API_URL } from '../config/apiConfig';

const Dashboard = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const { reminders, stats } = useReminders();
    const [adherence, setAdherence] = useState(null);
    const [safetyAudit, setSafetyAudit] = useState(null);
    const [loadingAudit, setLoadingAudit] = useState(false);

    // Fetch adherence stats from API
    useEffect(() => {
        const fetchStats = async () => {
            if (!localStorage.getItem('token')) return;
            try {
                const { data } = await axios.get(`${API_URL}/reminders/stats`);
                setAdherence(data);
            } catch (_) {
                // Fallback: calculate from local reminders
                const total = reminders.length;
                const taken = reminders.filter(r => r.status === 'completed').length;
                setAdherence({
                    adherenceScore: total > 0 ? Math.round((taken / total) * 100) : 100,
                    streak: 0,
                    daily: {},
                    total,
                    taken,
                    missed: stats.missed,
                });
            }
        };
        fetchStats();
    }, [reminders.length]);

    // Fetch Safety Audit
    useEffect(() => {
        const fetchSafetyAudit = async () => {
            if (!localStorage.getItem('token')) return;
            setLoadingAudit(true);
            try {
                const { data } = await axios.post(`${API_URL}/safety/audit`);
                setSafetyAudit(data);
            } catch (error) {
                console.error('Safety audit fetch error', error);
            } finally {
                setLoadingAudit(false);
            }
        };
        fetchSafetyAudit();
    }, [reminders.length]);

    const upcomingReminders = useMemo(() => reminders
        .filter(r => getStatus(r) === 'upcoming')
        .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
        .slice(0, 3), [reminders]);

    const [totalMeds, setTotalMeds] = useState(0);

    useEffect(() => {
        const fetchMeds = async () => {
            if (!localStorage.getItem('token')) return;
            try {
                const { data } = await axios.get(`${API_URL}/medications`);
                setTotalMeds(data.length);
            } catch (error) {
                console.error('Meds fetch error', error);
            }
        };
        fetchMeds();
    }, []);

    const firstName = user?.name?.split(' ')[0] || 'User';

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-10">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-[2rem] p-10 text-white shadow-2xl border border-white/10 group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 via-blue-700/90 to-indigo-900/90 opacity-95 transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight uppercase italic">
                            {t('dashboard_greeting')}, {firstName} 👋
                        </h1>
                        <p className="text-indigo-100 font-medium opacity-80 text-lg uppercase tracking-wider">
                            MedSuree — AI Powered Medication Safety Platform
                        </p>
                        <div className="mt-6 flex flex-wrap gap-4">
                            <Link to="/medications" className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-lg shadow-black/20">
                                + {t('meds_add')}
                            </Link>
                            <button onClick={() => window.dispatchEvent(new CustomEvent('toggle-assistant'))} className="bg-indigo-500/30 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500/40 transition-colors">
                                {t('nav_aiAssistant')}
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                        <div className="bg-black/20 backdrop-blur-md px-5 py-2 rounded-2xl text-sm font-bold flex items-center border border-white/10 w-fit">
                            <Shield size={18} className="mr-2 text-teal-300" />
                            {user?.subscription?.plan?.toUpperCase() || 'FREE PLAN'}
                        </div>
                        {stats.upcoming > 0 && (
                            <div className="bg-emerald-500 text-white px-5 py-2 rounded-2xl text-sm font-black flex items-center shadow-lg uppercase tracking-widest w-fit animate-pulse">
                                <Bell size={18} className="mr-2" />
                                {stats.upcoming} {t('dashboard_upcoming')}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Professional Insight Cards (Top Row) */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <InsightCard
                    title={t('dashboard_total_meds')}
                    value={totalMeds}
                    icon={<Plus size={20} className="text-blue-500" />}
                    trend={t('dashboard_trend_meds')}
                />
                <InsightCard
                    title={t('dashboard_upcoming')}
                    value={stats.upcoming}
                    icon={<Clock size={20} className="text-indigo-500" />}
                    trend={t('dashboard_trend_upcoming')}
                />
                <InsightCard
                    title={t('dashboard_missed')}
                    value={stats.missed}
                    icon={<AlertCircle size={20} className="text-rose-500" />}
                    trend={stats.missed > 0 ? t('dashboard_trend_missed_attention') : t('dashboard_trend_missed_perfect')}
                />
                <InsightCard
                    title={t('dashboard_adherence')}
                    value={`${adherence?.adherenceScore ?? 100}%`}
                    icon={<Activity size={20} className="text-emerald-500" />}
                    trend={t('dashboard_trend_streak', { streak: adherence?.streak ?? 0 })}
                />
                <InsightCard
                    title={t('dashboard_safety_score')}
                    value={loadingAudit ? "..." : (safetyAudit?.safetyScore ?? 100)}
                    icon={<Shield size={20} className="text-amber-500" />}
                    trend={safetyAudit?.riskLevel ? `${safetyAudit.riskLevel} Risk` : "Analyzing..."}
                    color={safetyAudit?.riskLevel === 'High' ? 'red' : safetyAudit?.riskLevel === 'Moderate' ? 'amber' : 'emerald'}
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Analytics & Timeline */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Adherence Analytics */}
                    {adherence && (
                        <div className="glass-card rounded-[2rem] p-8 border-white/5 shadow-3xl">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight uppercase italic mb-6">
                                <Activity size={24} className="text-emerald-500" />
                                {t('dashboard_analytics_title')}
                            </h2>
                            <AdherenceChart
                                daily={adherence.daily || {}}
                                streak={adherence.streak || 0}
                                score={adherence.adherenceScore ?? 100}
                            />
                        </div>
                    )}

                    {/* Medication Timeline (Requirement 30) */}
                    <div className="glass-card rounded-[2rem] p-8 border-white/5 shadow-3xl">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight uppercase italic mb-6">
                            <Clock size={24} className="text-indigo-500" />
                            {t('dashboard_timeline_title')}
                        </h2>
                        {reminders.length > 0 ? (
                            <div className="relative pl-8 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-500/20">
                                {reminders.slice(0, 5).map((r, idx) => (
                                    <div key={r._id || idx} className="relative">
                                        <div className={`absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-4 border-gray-900 z-10 ${r.status === 'completed' ? 'bg-emerald-500' : r.status === 'missed' ? 'bg-rose-500' : 'bg-indigo-500 animate-pulse'}`} />
                                        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                                            <div>
                                                <p className="font-black text-gray-900 dark:text-white uppercase text-sm tracking-widest">{r.medicineName}</p>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase mt-1">{r.time} • {r.dosage}</p>
                                            </div>
                                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${r.status === 'completed' ? 'text-emerald-500 bg-emerald-500/10' : r.status === 'missed' ? 'text-rose-500 bg-rose-500/10' : 'text-indigo-400 bg-indigo-500/10'}`}>
                                                {r.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 opacity-50 italic">{t('dashboard_no_timeline')}</div>
                        )}
                    </div>
                </div>

                {/* Right Column: Safety Alerts & Quick Actions */}
                <div className="space-y-8">
                    {/* Safety Audit Summary (Requirement 28/29) */}
                    <div className="glass-card rounded-[2rem] p-8 border-white/5 shadow-3xl bg-gradient-to-b from-transparent to-amber-500/5">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight uppercase italic mb-6">
                            <Shield size={24} className="text-amber-500" />
                            {t('dashboard_risk_alerts')}
                        </h2>
                        {loadingAudit ? (
                            <div className="flex flex-col items-center py-10 gap-3">
                                <DashboardLoader className="animate-spin text-amber-500" />
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('dashboard_safety_loading')}</p>
                            </div>
                        ) : safetyAudit?.alerts?.length > 0 ? (
                            <div className="space-y-4">
                                {safetyAudit.alerts.map((alert, i) => (
                                    <div key={i} className={`p-4 rounded-2xl border ${alert.severity === 'High' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <AlertTriangle size={14} className={alert.severity === 'High' ? 'text-rose-500' : 'text-amber-500'} />
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${alert.severity === 'High' ? 'text-rose-500' : 'text-amber-500'}`}>
                                                {alert.type}
                                            </p>
                                        </div>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white mb-1">{alert.message}</p>
                                        <p className="text-[10px] text-gray-500 leading-tight">{alert.detail}</p>
                                    </div>
                                ))}
                                {safetyAudit.recommendations?.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-white/5">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{t('dashboard_recommendations')}</p>
                                        <ul className="space-y-2">
                                            {safetyAudit.recommendations.map((rec, i) => (
                                                <li key={i} className="text-[11px] font-medium text-indigo-400 flex gap-2">
                                                    <ChevronRight size={12} className="shrink-0 mt-0.5" />
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <CheckCircle size={32} />
                                </div>
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">{t('dashboard_safety_optimal')}</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <ActionCard to="/reminders" icon={<Bell size={24} />} label="Reminders" color="blue" />
                        <ActionCard to="/analysis" icon={<AlertTriangle size={24} />} label="Safety Audit" color="amber" />
                        <ActionCard to="/family" icon={<Users size={24} />} label="Family Hub" color="purple" />
                        <ActionCard to="/medications" icon={<Plus size={24} />} label="Add Meds" color="indigo" />
                        <Link to="/prescription-scan" className="col-span-2 flex items-center justify-between p-6 rounded-3xl border border-teal-500/20 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-teal-500/20 rounded-2xl group-hover:scale-110 transition-transform">
                                    <Camera size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-[12px] uppercase tracking-wider">{t('dashboard_scan_title')}</p>
                                    <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">{t('dashboard_scan_sub')}</p>
                                </div>
                            </div>
                            <ChevronRight size={20} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActionCard = ({ to, icon, label, color }) => {
    const colorClasses = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20',
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20',
    };
    return (
        <Link to={to} className={`flex flex-col items-center justify-center p-6 rounded-3xl border backdrop-blur-sm transition-all duration-300 group ${colorClasses[color]}`}>
            <div className="mb-3 transform group-hover:scale-110 transition-transform">{icon}</div>
            <span className="font-black text-[10px] uppercase tracking-widest">{label}</span>
        </Link>
    );
};

const InsightCard = ({ title, value, icon, trend, color }) => {
    const colorClasses = {
        red: 'text-rose-500',
        amber: 'text-amber-500',
        emerald: 'text-emerald-500',
        default: 'text-gray-900 dark:text-white'
    };
    return (
        <div className="glass-card hover-glow rounded-2xl p-5 border border-white/5 bg-white/40 dark:bg-white/5 flex flex-col justify-between h-full min-h-[120px]">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{title}</h3>
                <div className="p-2 rounded-xl bg-white/50 dark:bg-white/5 shadow-sm">{icon}</div>
            </div>
            <div>
                <p className={`text-3xl font-black tracking-tight ${colorClasses[color] || colorClasses.default}`}>{value}</p>
                <p className="text-[10px] text-gray-500 font-medium mt-1 uppercase tracking-wider">{trend}</p>
            </div>
        </div>
    );
};

const DashboardLoader = ({ className }) => <Clock className={`${className} animate-spin`} size={24} />;

export default Dashboard;
