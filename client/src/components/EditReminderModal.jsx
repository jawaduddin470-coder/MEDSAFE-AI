import React, { useState } from 'react';
import { Clock, Calendar, RefreshCw, Loader } from 'lucide-react';
import { useReminders, getStatus } from '../context/ReminderContext';

const REPEAT_OPTIONS = [
    { value: 'none', label: 'None' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'custom', label: 'Custom (every N days)' },
];

const EditReminderModal = ({ reminder, onClose }) => {
    const { updateReminder } = useReminders();
    const [form, setForm] = useState({
        medicineName: reminder.medicineName,
        dosage: reminder.dosage || '',
        date: reminder.date,
        time: reminder.time,
        repeat: reminder.repeat || 'none',
        intervalDays: reminder.intervalDays || 1,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const selectedDT = new Date(`${form.date}T${form.time}`);
        if (selectedDT <= new Date()) {
            setError('⏰ The selected time is in the past. Please choose a future time.');
            return;
        }
        setSubmitting(true);
        await new Promise((res) => setTimeout(res, 400));
        updateReminder({ ...reminder, ...form, intervalDays: Number(form.intervalDays) });
        setSubmitting(false);
        onClose();
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Edit Reminder</h3>

                {error && (
                    <div className="mb-4 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medicine Name</label>
                        <input type="text" name="medicineName" value={form.medicineName} onChange={handleChange} required className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dosage (optional)</label>
                        <input type="text" name="dosage" value={form.dosage} onChange={handleChange} className="input-field" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <Calendar size={13} className="inline mr-1" />Date
                            </label>
                            <input type="date" name="date" value={form.date} min={today} onChange={handleChange} required className="input-field" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <Clock size={13} className="inline mr-1" />Time
                            </label>
                            <input type="time" name="time" value={form.time} onChange={handleChange} required className="input-field" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <RefreshCw size={13} className="inline mr-1" />Repeat
                        </label>
                        <select name="repeat" value={form.repeat} onChange={handleChange} className="input-field">
                            {REPEAT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    {form.repeat === 'custom' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Repeat every (days)</label>
                            <input type="number" name="intervalDays" value={form.intervalDays} onChange={handleChange} min="1" max="365" className="input-field" />
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                            {submitting ? <><Loader size={16} className="animate-spin" /> Saving…</> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditReminderModal;
