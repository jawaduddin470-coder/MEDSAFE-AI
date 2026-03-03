import React, { useState } from 'react';
import { Plus, Pill, Clock, Calendar, RefreshCw, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { useReminders, getStatus } from '../context/ReminderContext';

const REPEAT_OPTIONS = [
    { value: 'none', label: 'None' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'custom', label: 'Custom (every N days)' },
];

const INITIAL_FORM = {
    medicineName: '',
    dosage: '',
    date: '',
    time: '',
    repeat: 'none',
    intervalDays: 1,
};

const ReminderForm = () => {
    const { reminders, addReminder } = useReminders();
    const [form, setForm] = useState(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null); // { type: 'error'|'warning'|'success', message }

    const showFeedback = (type, message) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback(null), 5000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (feedback) setFeedback(null);
    };

    const validate = () => {
        const { medicineName, date, time, repeat, intervalDays } = form;

        // 1. Past-time check
        const selectedDT = new Date(`${date}T${time}`);
        if (selectedDT <= new Date()) {
            showFeedback('error', '⏰ The selected date/time is in the past. Please choose a future time.');
            return false;
        }

        // 2. Duplicate check
        const isDuplicate = reminders.some(
            (r) =>
                r.medicineName.toLowerCase() === medicineName.toLowerCase() &&
                r.date === date &&
                r.time === time
        );
        if (isDuplicate) {
            showFeedback('error', '⚠️ An identical reminder already exists for this medicine at the same time.');
            return false;
        }

        // 3. Overdose warning – same medicine within 4 hours
        const upcomingForMed = reminders.filter(
            (r) =>
                r.medicineName.toLowerCase() === medicineName.toLowerCase() &&
                getStatus(r) === 'upcoming'
        );
        for (const r of upcomingForMed) {
            const existingDT = new Date(`${r.date}T${r.time}`);
            const diffHours = Math.abs(selectedDT - existingDT) / (1000 * 60 * 60);
            if (diffHours < 4) {
                showFeedback(
                    'warning',
                    `🚨 Overdose Warning: "${medicineName}" is already scheduled within 4 hours (${r.date} at ${r.time}). Please confirm this is safe.`
                );
                return false;
            }
        }

        // 4. Custom interval validation
        if (repeat === 'custom' && (!intervalDays || Number(intervalDays) < 1)) {
            showFeedback('error', 'Please enter a valid interval (minimum 1 day) for custom repeat.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        // Simulate slight processing delay for UX
        await new Promise((res) => setTimeout(res, 600));

        addReminder({ ...form, intervalDays: Number(form.intervalDays) });
        setForm(INITIAL_FORM);
        showFeedback('success', `✅ Reminder for "${form.medicineName}" added successfully!`);
        setSubmitting(false);
    };

    // ── Min date = today
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="glass-card p-10 rounded-[2.5rem] border-white/5 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary opacity-50" />
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-4">
                <div className="bg-indigo-500/10 p-4 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform duration-500 border border-indigo-500/10">
                    <Plus size={24} />
                </div>
                NEW PROTOCOL
            </h2>

            {/* Feedback banner */}
            {feedback && (
                <div
                    className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium flex items-start gap-2 animate-fadeIn
            ${feedback.type === 'error' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700' : ''}
            ${feedback.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700' : ''}
            ${feedback.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700' : ''}
          `}
                >
                    {feedback.type === 'warning' && <AlertTriangle size={16} className="mt-0.5 shrink-0" />}
                    {feedback.type === 'success' && <CheckCircle size={16} className="mt-0.5 shrink-0" />}
                    <span>{feedback.message}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Medicine Name */}
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                        Medicine Name
                    </label>
                    <div className="relative">
                        <Pill className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500/40" size={18} />
                        <input
                            type="text"
                            name="medicineName"
                            value={form.medicineName}
                            onChange={handleChange}
                            placeholder="e.g. Aspirin"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white outline-none focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Dosage */}
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                        Dosage
                    </label>
                    <input
                        type="text"
                        name="dosage"
                        value={form.dosage}
                        onChange={handleChange}
                        placeholder="e.g. 500mg"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-teal-500/50 transition-all font-medium"
                    />
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <Calendar size={14} className="inline mr-1 text-blue-500" /> Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={form.date}
                            min={today}
                            onChange={handleChange}
                            required
                            className="input-modern"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <Clock size={14} className="inline mr-1 text-blue-500" /> Time (HH:MM) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="time"
                            name="time"
                            value={form.time}
                            onChange={handleChange}
                            required
                            className="input-modern"
                        />
                    </div>
                </div>

                {/* Repeat */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <RefreshCw size={14} className="inline mr-1 text-blue-500" /> Repeat
                    </label>
                    <select
                        name="repeat"
                        value={form.repeat}
                        onChange={handleChange}
                        className="input-field"
                    >
                        {REPEAT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Custom interval */}
                {form.repeat === 'custom' && (
                    <div className="animate-fadeIn">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Repeat every (days)
                        </label>
                        <input
                            type="number"
                            name="intervalDays"
                            value={form.intervalDays}
                            onChange={handleChange}
                            min="1"
                            max="365"
                            className="input-modern"
                        />
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-6 btn-primary !py-5 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-500 hover:scale-[1.02] shadow-indigo-500/20"
                >
                    {submitting ? (
                        <>
                            <Loader size={20} className="animate-spin" /> SYNCHRONIZING...
                        </>
                    ) : (
                        <>
                            <Plus size={20} /> ACTIVATE PROTOCOL
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ReminderForm;
