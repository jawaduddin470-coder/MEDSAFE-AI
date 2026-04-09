import React, { useState, useEffect } from 'react';
import { Plus, Pill, Clock, Calendar, RefreshCw, AlertTriangle, CheckCircle, Loader, Users } from 'lucide-react';
import { useReminders, getStatus } from '../context/ReminderContext';
import axios from 'axios';
import { API_URL as API_BASE } from '../config/apiConfig';

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
    familyMember: '', // null/empty means "me"
};

const ReminderForm = ({ defaultProfile = 'me' }) => {
    const { reminders, addReminder } = useReminders();
    const [form, setForm] = useState(INITIAL_FORM);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null); // { type: 'error'|'warning'|'success', message }

    useEffect(() => {
        const fetchFamily = async () => {
            try {
                const { data } = await axios.get(`${API_BASE}/family`);
                setFamilyMembers(data);
            } catch (err) { console.error(err); }
        };
        fetchFamily();
    }, []);

    useEffect(() => {
        setForm(prev => ({
            ...prev,
            familyMember: defaultProfile === 'me' ? '' : defaultProfile
        }));
    }, [defaultProfile]);

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
                r.time === time &&
                (r.familyMember === form.familyMember || (!r.familyMember && !form.familyMember))
        );
        if (isDuplicate) {
            showFeedback('error', '⚠️ An identical reminder already exists for this profile at the same time.');
            return false;
        }

        // 3. Overdose warning – same medicine within 4 hours
        const sameProfileReminders = reminders.filter(r => (r.familyMember || '') === (form.familyMember || ''));
        const upcomingForMed = sameProfileReminders.filter(
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
                    `🚨 Overdose Warning: "${medicineName}" is already scheduled within 4 hours (${r.date} at ${r.time}). Please confirm safety.`
                );
                return false;
            }
        }

        // 4. Custom interval validation
        if (repeat === 'custom' && (!intervalDays || Number(intervalDays) < 1)) {
            showFeedback('error', 'Please enter a valid interval (minimum 1 day).');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
        const submissionData = { ...form, intervalDays: Number(form.intervalDays) };
        if (!submissionData.familyMember) delete submissionData.familyMember;

        try {
            await addReminder(submissionData);
            setForm({ ...INITIAL_FORM, familyMember: defaultProfile === 'me' ? '' : defaultProfile });
            showFeedback('success', `✅ Protocol activated for ${form.medicineName}!`);
        } catch (err) {
            showFeedback('error', 'Failed to save reminder.');
        } finally {
            setSubmitting(false);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="glass-card p-10 rounded-[2.5rem] border-white/5 relative overflow-hidden group shadow-2xl">
            <div className={`absolute top-0 left-0 w-full h-1 ${form.familyMember ? 'bg-purple-500' : 'bg-indigo-500'} opacity-50`} />
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-4">
                <div className={`${form.familyMember ? 'bg-purple-500/10 text-purple-400 border-purple-500/10' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10'} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500 border`}>
                    <Plus size={24} />
                </div>
                NEW PROTOCOL
            </h2>

            {feedback && (
                <div className={`mb-4 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-start gap-2 animate-fadeIn border
                    ${feedback.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' : ''}
                    ${feedback.type === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : ''}
                    ${feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                `}>
                    {feedback.type === 'warning' && <AlertTriangle size={16} className="mt-0.5 shrink-0" />}
                    {feedback.type === 'success' && <CheckCircle size={16} className="mt-0.5 shrink-0" />}
                    <span>{feedback.message}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Profile Selection */}
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Assign to Profile</label>
                    <div className="relative">
                        <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500/40" size={18} />
                        <select
                            name="familyMember"
                            value={form.familyMember}
                            onChange={handleChange}
                            className="input-modern pl-14 font-medium appearance-none"
                        >
                            <option value="">Myself (Main Profile)</option>
                            {familyMembers.map(m => (
                                <option key={m._id} value={m._id}>{m.name} ({m.relation})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Medicine Name</label>
                    <div className="relative">
                        <Pill className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500/40" size={18} />
                        <input
                            type="text"
                            name="medicineName"
                            value={form.medicineName}
                            onChange={handleChange}
                            placeholder="e.g. Aspirin"
                            required
                            className="input-modern pl-14 font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Dosage</label>
                    <input
                        type="text"
                        name="dosage"
                        value={form.dosage}
                        onChange={handleChange}
                        placeholder="e.g. 500mg"
                        className="input-modern font-medium"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2">Date</label>
                        <input
                            type="date"
                            name="date"
                            value={form.date}
                            min={today}
                            onChange={handleChange}
                            required
                            className="input-modern !py-3"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2">Time</label>
                        <input
                            type="time"
                            name="time"
                            value={form.time}
                            onChange={handleChange}
                            required
                            className="input-modern !py-3"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2">Repeat Frequency</label>
                    <select
                        name="repeat"
                        value={form.repeat}
                        onChange={handleChange}
                        className="input-modern appearance-none"
                    >
                        {REPEAT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {form.repeat === 'custom' && (
                    <div className="animate-fadeIn">
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2">Interval (Days)</label>
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

                <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full mt-6 btn-primary hover-glow !py-5 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-500 hover:scale-[1.02] shadow-lg ${form.familyMember ? 'bg-purple-600 shadow-purple-500/20' : 'shadow-indigo-500/20'}`}
                >
                    {submitting ? (
                        <><Loader size={20} className="animate-spin" /> SYNCHRONIZING...</>
                    ) : (
                        <><Plus size={20} /> ACTIVATE PROTOCOL</>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ReminderForm;
