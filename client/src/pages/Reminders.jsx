import React, { useState } from 'react';
import { Bell, Pill, CheckCircle, AlertCircle, Clock, CalendarDays, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useReminders, getStatus } from '../context/ReminderContext';
import ReminderForm from '../components/ReminderForm';
import ReminderCard from '../components/ReminderCard';
import ConfirmModal from '../components/ConfirmModal';
import EditReminderModal from '../components/EditReminderModal';

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
    const { reminders, stats, deleteReminder } = useReminders();
    const [filter, setFilter] = useState('all');
    const [deleteTarget, setDeleteTarget] = useState(null);   // id pending confirmation
    const [editTarget, setEditTarget] = useState(null);       // reminder to edit

    const filteredReminders =
        filter === 'all'
            ? reminders
            : reminders.filter((r) => getStatus(r) === filter);

    const sorted = [...filteredReminders].sort((a, b) => {
        const dtA = new Date(`${a.date}T${a.time}`);
        const dtB = new Date(`${b.date}T${b.time}`);
        return dtA - dtB;
    });

    const handleDeleteRequest = (id) => setDeleteTarget(id);
    const handleDeleteConfirm = () => {
        if (deleteTarget) deleteReminder(deleteTarget);
        setDeleteTarget(null);
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* ── Header ─────────────────────────────────────────── */}
            {/* ── Header ─────────────────────────────────────────── */}
            <div className="text-center space-y-4 py-8">
                <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic flex items-center justify-center gap-4">
                    <Bell size={48} className="text-indigo-500 animate-pulse" />
                    Neural <span className="text-indigo-600 dark:text-indigo-400">Reminders</span>
                </h1>
                <p className="text-gray-500 font-bold uppercase tracking-[0.4em] text-xs">Synchronized Adherence Engine</p>
            </div>

            {/* ── Stats ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Pill size={24} />}
                    label="Active Protocol"
                    value={stats.total}
                    colorClass="text-blue-400"
                />
                <StatCard
                    icon={<Clock size={24} />}
                    label="Upcoming Pulse"
                    value={stats.upcoming}
                    colorClass="text-teal-400"
                />
                <StatCard
                    icon={<CheckCircle size={24} />}
                    label="Success Rate"
                    value={stats.completed}
                    colorClass="text-emerald-400"
                />
                <StatCard
                    icon={<AlertCircle size={24} />}
                    label="Safety Alerts"
                    value={stats.missed}
                    colorClass="text-red-400"
                />
            </div>

            {/* ── Main Layout ─────────────────────────────────────── */}
            <div className="grid lg:grid-cols-[380px,1fr] gap-6 items-start">
                {/* Form */}
                <div className="lg:sticky lg:top-24">
                    <ReminderForm />
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
                                {f} {f !== 'all' && <span className="ml-2 opacity-50">[{stats[f] ?? 0}]</span>}
                            </button>
                        ))}
                    </div>

                    {/* Empty state */}
                    {sorted.length === 0 ? (
                        <div className="glass-card rounded-[3rem] border-white/5 border-dashed border-2 py-24 px-10 text-center">
                            <div className="flex justify-center mb-6">
                                <div className="bg-teal-500/10 p-8 rounded-[2rem] text-teal-400">
                                    <CalendarDays size={64} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase mb-4">
                                {filter === 'all' ? 'System Idle' : `No ${filter} data`}
                            </h3>
                            <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
                                {filter === 'all'
                                    ? 'Awaiting prescription input. Initialize your first reminder to activate the audit engine.'
                                    : `The ${filter} log is currently empty.`}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sorted.map((reminder) => (
                                <ReminderCard
                                    key={reminder.id}
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
