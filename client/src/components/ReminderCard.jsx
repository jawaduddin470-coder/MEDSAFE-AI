import React, { useState, useEffect } from 'react';
import { Pill, Clock, Edit2, Trash2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { getStatus } from '../context/ReminderContext';

// ─── Status badge config ──────────────────────────────────────────────────────
const STATUS_CONFIG = {
    upcoming: {
        label: 'Upcoming',
        className: 'badge-upcoming',
        icon: <Clock size={12} />,
    },
    completed: {
        label: 'Completed',
        className: 'badge-completed',
        icon: <CheckCircle size={12} />,
    },
    missed: {
        label: 'Missed',
        className: 'badge-missed',
        icon: <AlertCircle size={12} />,
    },
};

const REPEAT_LABELS = {
    none: null,
    daily: 'Daily',
    weekly: 'Weekly',
    custom: (days) => `Every ${days}d`,
};

// ─── Live countdown ───────────────────────────────────────────────────────────
function useCountdown(reminder) {
    const [countdown, setCountdown] = useState('');

    useEffect(() => {
        const update = () => {
            const status = getStatus(reminder);
            if (status !== 'upcoming') {
                setCountdown('');
                return;
            }
            const diff = new Date(`${reminder.date}T${reminder.time}`) - new Date();
            if (diff <= 0) {
                setCountdown('Now');
                return;
            }
            const h = Math.floor(diff / 3_600_000);
            const m = Math.floor((diff % 3_600_000) / 60_000);
            const s = Math.floor((diff % 60_000) / 1_000);
            if (h > 0) setCountdown(`${h}h ${m}m`);
            else if (m > 0) setCountdown(`${m}m ${s}s`);
            else setCountdown(`${s}s`);
        };
        update();
        const id = setInterval(update, 1_000);
        return () => clearInterval(id);
    }, [reminder]);

    return countdown;
}

// ─── ReminderCard ─────────────────────────────────────────────────────────────
const ReminderCard = ({ reminder, onDelete, onEdit }) => {
    const status = getStatus(reminder);
    const cfg = STATUS_CONFIG[status];
    const countdown = useCountdown(reminder);

    const repeatLabel =
        reminder.repeat === 'custom'
            ? REPEAT_LABELS.custom(reminder.intervalDays)
            : REPEAT_LABELS[reminder.repeat];

    // Format scheduled time for display
    const scheduledDate = new Date(`${reminder.date}T${reminder.time}`);
    const formattedDate = scheduledDate.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
    const formattedTime = scheduledDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });

    return (
        <div
            className={`group glass-card rounded-[2.5rem] border-white/5 transition-all duration-500
        hover:bg-white/[0.07] hover:-translate-y-1 animate-fadeIn overflow-hidden relative shadow-lg hover:shadow-2xl
        ${status === 'missed' ? 'border-red-500/20' : ''}
      `}
        >
            {/* Hover border flash */}
            <div className={`absolute top-0 left-0 w-1 h-full scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300
                ${status === 'upcoming' ? 'bg-blue-500' : ''}
                ${status === 'completed' ? 'bg-green-500' : ''}
                ${status === 'missed' ? 'bg-red-500' : ''}
            `} />
            <div className="flex items-center gap-6 p-8">
                {/* Icon */}
                <div
                    className={`p-5 rounded-2xl shrink-0 border transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3
            ${status === 'upcoming' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : ''}
            ${status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
            ${status === 'missed' ? 'bg-red-500/10 text-red-400 border-red-500/20' : ''}
          `}
                >
                    <Pill size={28} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h3 className="text-xl font-black text-white tracking-tight truncate uppercase">{reminder.medicineName}</h3>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${status === 'upcoming' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                            {cfg.icon} {cfg.label}
                        </span>
                        {repeatLabel && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                <RefreshCw size={10} /> {repeatLabel}
                            </span>
                        )}
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        {reminder.dosage && <span className="text-teal-500/60 font-black">{reminder.dosage}</span>}
                        <Clock size={12} className="inline opacity-40" />
                        {formattedDate} <span className="opacity-30">@</span> {formattedTime}
                    </p>
                </div>

                {/* Countdown */}
                {countdown && (
                    <div className="hidden sm:flex flex-col items-center shrink-0">
                        <span className="text-xs text-gray-400 dark:text-gray-500">in</span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">{countdown}</span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={() => onEdit(reminder)}
                        title="Edit reminder"
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-teal-500/5 text-teal-400/40 hover:text-teal-400 hover:bg-teal-500/20 transition-all border border-transparent hover:border-teal-500/10"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        onClick={() => onDelete(reminder.id)}
                        title="Delete reminder"
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/20 transition-all border border-transparent hover:border-red-500/10"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReminderCard;
