import React, { useState } from 'react';
import { Bell, Pill, CheckCircle, AlertCircle, Clock, CalendarDays, PlusCircle, Users } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useReminders, getStatus } from '../context/ReminderContext';
import ReminderForm from '../components/ReminderForm';
import ReminderCard from '../components/ReminderCard';
import ConfirmModal from '../components/ConfirmModal';
import EditReminderModal from '../components/EditReminderModal';
import { useLanguage } from '../context/LanguageContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, colorClass }) => (
    <div className="glass-card p-6 rounded-[2rem] border-white/5 flex items-center gap-5 transition-all duration-500 hover:bg-white/[0.07] group">
        <div className={`p-4 rounded-2xl ${colorClass} bg-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 border border-white/5`}>
            {icon}
        </div>
        <div>
            <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{value}</p>
            <p className="text-[10px] font-bold text-gray-600 dark:text-gray-500 uppercase tracking-[0.2em]">{label}</p>
        </div>
    </div>
);

// ─── Filter tabs ──────────────────────────────────────────────────────────────
const FILTERS = ['all', 'upcoming', 'completed', 'missed'];

// ─── Reminders Page ───────────────────────────────────────────────────────────
const Reminders = () => {
    const { t } = useLanguage();
    const { reminders, stats, deleteReminder } = useReminders();
    const [filter, setFilter] = useState('all');
    const [selectedProfile, setSelectedProfile] = useState('me');
    const [familyMembers, setFamilyMembers] = useState([]);
    const [deleteTarget, setDeleteTarget] = useState(null);   // id pending confirmation
    const [editTarget, setEditTarget] = useState(null);       // reminder to edit

    React.useEffect(() => {
        const fetchFamily = async () => {
            try {
                const { data } = await axios.get(`${API_BASE}/api/family`);
                setFamilyMembers(data);
            } catch (err) { console.error(err); }
        };
        fetchFamily();
    }, []);

    // Filter by profile first, then by status tab
    const profileReminders = React.useMemo(() => selectedProfile === 'me'
        ? reminders.filter(r => !r.familyMember)
        : reminders.filter(r => r.familyMember === selectedProfile), [reminders, selectedProfile]);

    const filteredReminders = React.useMemo(() =>
        filter === 'all'
            ? profileReminders
            : profileReminders.filter((r) => getStatus(r) === filter), [filter, profileReminders]);

    const sorted = React.useMemo(() => [...filteredReminders].sort((a, b) => {
        const dtA = new Date(`${a.date}T${a.time}`).getTime();
        const dtB = new Date(`${b.date}T${b.time}`).getTime();
        return dtA - dtB;
    }), [filteredReminders]);

    // Stats for the selected profile
    const profileStats = React.useMemo(() => ({
        total: profileReminders.length,
        upcoming: profileReminders.filter(r => getStatus(r) === 'upcoming').length,
        completed: profileReminders.filter(r => r.status === 'completed').length,
        missed: profileReminders.filter(r => getStatus(r) === 'missed').length
    }), [profileReminders]);

    const handleDeleteRequest = (id) => setDeleteTarget(id);
    const handleDeleteConfirm = () => {
        if (deleteTarget) deleteReminder(deleteTarget);
        setDeleteTarget(null);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* ── Header ─────────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 py-6 border-b border-white/5">
                <div className="text-left space-y-1">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic flex items-center gap-4">
                        <Bell size={40} className="text-indigo-500" />
                        Neural <span className="text-indigo-600 dark:text-indigo-400">Reminders</span>
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.4em] text-[10px]">Synchronized Adherence Engine</p>
                </div>

                {/* Profile Selector */}
                <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                    <button
                        onClick={() => setSelectedProfile('me')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedProfile === 'me' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-indigo-400'}`}
                    >
                        {t('nav_dashboard')}
                    </button>
                    {familyMembers.map(member => (
                        <button
                            key={member._id}
                            onClick={() => setSelectedProfile(member._id)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedProfile === member._id ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-purple-400'}`}
                        >
                            {member.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Stats ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Pill size={24} />}
                    label="Active Protocol"
                    value={profileStats.total}
                    colorClass="text-blue-400"
                />
                <StatCard
                    icon={<Clock size={24} />}
                    label="Upcoming Pulse"
                    value={profileStats.upcoming}
                    colorClass="text-teal-400"
                />
                <StatCard
                    icon={<CheckCircle size={24} />}
                    label="Success Rate"
                    value={profileStats.completed}
                    colorClass="text-emerald-400"
                />
                <StatCard
                    icon={<AlertCircle size={24} />}
                    label="Safety Alerts"
                    value={profileStats.missed}
                    colorClass="text-red-400"
                />
            </div>

            {/* ── Main Layout ─────────────────────────────────────── */}
            <div className="grid lg:grid-cols-[380px,1fr] gap-10 items-start">
                {/* Form */}
                <div className="lg:sticky lg:top-24">
                    <ReminderForm defaultProfile={selectedProfile} />
                </div>

                {/* Reminder List */}
                <div className="space-y-8">
                    {/* Filter tabs */}
                    <div className="flex gap-4 flex-wrap">
                        {FILTERS.map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border
                                    ${filter === f
                                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                                        : 'bg-white/10 dark:bg-white/5 text-gray-600 dark:text-gray-500 border-white/10 hover:border-indigo-500/30'
                                    }`}
                            >
                                {f} {f !== 'all' && <span className="ml-2 opacity-50">[{profileStats[f] ?? 0}]</span>}
                            </button>
                        ))}
                    </div>

                    {/* Empty state */}
                    {sorted.length === 0 ? (
                        <div className="glass-card rounded-[3rem] border-white/5 border-dashed border-2 py-24 px-10 text-center">
                            <div className="flex justify-center mb-6">
                                <div className={`${selectedProfile === 'me' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-purple-500/10 text-purple-400'} p-8 rounded-[2rem]`}>
                                    <CalendarDays size={64} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase mb-4">
                                {filter === 'all' ? 'No Schedule Active' : `No ${filter} data`}
                            </h3>
                            <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
                                {filter === 'all'
                                    ? `Awaiting prescription input for ${selectedProfile === 'me' ? 'you' : familyMembers.find(m => m._id === selectedProfile)?.name}.`
                                    : `The ${filter} log for this profile is currently empty.`}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-4">
                                <Users size={14} className="text-indigo-500" />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                    Displaying logs for: {selectedProfile === 'me' ? 'Secondary Node (Self)' : `${familyMembers.find(m => m._id === selectedProfile)?.name} Profile`}
                                </span>
                            </div>
                            {sorted.map((reminder) => (
                                <ReminderCard
                                    key={reminder.id || reminder._id}
                                    reminder={reminder}
                                    onDelete={handleDeleteRequest}
                                    onEdit={setEditTarget}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {deleteTarget && (
                <ConfirmModal
                    message="Are you sure you want to delete this reminder? This action cannot be undone."
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
            {editTarget && (
                <EditReminderModal
                    reminder={editTarget}
                    onClose={() => setEditTarget(null)}
                />
            )}
        </div>
    );
};

export default Reminders;
