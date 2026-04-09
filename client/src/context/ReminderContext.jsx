import { createContext, useContext, useReducer, useEffect, useCallback, useState, useMemo } from 'react';
import { scheduleReminder, cancelReminder } from '../utils/reminderScheduler';
import axios from 'axios';
import { API_URL } from '../config/apiConfig';

// ─── Status helpers ───────────────────────────────────────────────────────────
export const getStatus = (reminder) => {
    if (reminder.status === 'completed') return 'completed';
    const now = new Date();
    const scheduled = new Date(`${reminder.date}T${reminder.time}`);
    if (scheduled <= now) return 'missed';
    return 'upcoming';
};

// ─── Reducer ─────────────────────────────────────────────────────────────────
const reminderReducer = (state, action) => {
    switch (action.type) {
        case 'LOAD': return action.payload;
        case 'ADD': return [action.payload, ...state];
        case 'UPDATE': return state.map(r => r._id === action.payload._id || r.id === action.payload.id ? action.payload : r);
        case 'DELETE': return state.filter(r => (r._id || r.id) !== action.payload);
        case 'MARK_COMPLETED':
            return state.map(r =>
                (r._id || r.id) === action.payload ? { ...r, status: 'completed', takenAt: new Date().toISOString() } : r
            );
        case 'RECALCULATE_STATUS':
            return state.map(r => ({
                ...r,
                status: r.status === 'completed' ? 'completed' : getStatus(r),
            }));
        default: return state;
    }
};

// ─── Context ──────────────────────────────────────────────────────────────────
const ReminderContext = createContext(null);

export const ReminderProvider = ({ children }) => {
    const [reminders, dispatch] = useReducer(reminderReducer, []);
    const [apiAvailable, setApiAvailable] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

    // ── Check auth and load from API or localStorage ───────────────────────
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Load from localStorage for unauthenticated users
            try {
                const stored = localStorage.getItem('medsafe_reminders');
                const loaded = stored ? JSON.parse(stored) : [];
                const refreshed = loaded.map(r => ({ ...r, status: r.status === 'completed' ? 'completed' : getStatus(r) }));
                dispatch({ type: 'LOAD', payload: refreshed });
            } catch {
                dispatch({ type: 'LOAD', payload: [] });
            }
            return;
        }

        setIsAuthenticated(true);

        // Load from MongoDB API
        const fetchReminders = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/reminders`);
                const refreshed = data.map(r => ({
                    ...r,
                    id: r._id, // alias for scheduler compatibility
                    status: r.status === 'completed' ? 'completed' : getStatus(r),
                }));
                dispatch({ type: 'LOAD', payload: refreshed });
                setApiAvailable(true);
            } catch (err) {
                console.warn('[ReminderContext] API unavailable, falling back to localStorage:', err.message);
                // Fallback to localStorage
                try {
                    const stored = localStorage.getItem('medsafe_reminders');
                    const loaded = stored ? JSON.parse(stored) : [];
                    dispatch({ type: 'LOAD', payload: loaded });
                } catch {
                    dispatch({ type: 'LOAD', payload: [] });
                }
            }
        };

        fetchReminders();
    }, []);

    // ── Persist to localStorage as offline cache ───────────────────────────
    useEffect(() => {
        localStorage.setItem('medsafe_reminders', JSON.stringify(reminders));
    }, [reminders]);

    // ── Re-calculate statuses every 30 seconds ─────────────────────────────
    useEffect(() => {
        const interval = setInterval(() => dispatch({ type: 'RECALCULATE_STATUS' }), 30_000);
        return () => clearInterval(interval);
    }, []);

    // ── Schedule notification timers for upcoming reminders ────────────────
    const upcomingReminders = useMemo(() =>
        reminders.filter(r => getStatus(r) === 'upcoming'),
        [reminders]
    );

    const scheduleKey = useMemo(() =>
        upcomingReminders.map(r => `${r._id || r.id}-${r.date}-${r.time}`).join(','),
        [upcomingReminders]
    );

    useEffect(() => {
        upcomingReminders.forEach(r => {
            scheduleReminder(r, async () => {
                // Fire the 3-layer alert system
                const alertEvent = new CustomEvent('medsuree-reminder-alert', { detail: r });
                window.dispatchEvent(alertEvent);

                dispatch({ type: 'MARK_COMPLETED', payload: r._id || r.id });

                // Sync taken status to API if available
                if (apiAvailable && r._id) {
                    try {
                        await axios.patch(`${API_URL}/reminders/${r._id}/taken`);
                    } catch (err) {
                        console.warn('[ReminderContext] Failed to sync taken status:', err.message);
                    }
                }

                // Handle recurring reminder creation
                if (r.repeat !== 'none') {
                    const nextDate = getNextDate(r);
                    if (nextDate) {
                        const newReminder = { ...r, date: nextDate, status: 'upcoming', id: undefined, _id: undefined, sent: false, takenAt: null };
                        await addReminder(newReminder);
                    }
                }
            });
        });

        return () => {
            upcomingReminders.forEach(r => cancelReminder(r._id || r.id));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scheduleKey, apiAvailable]);

    // ── Listen for Mark Taken from alert modal ─────────────────────────────
    useEffect(() => {
        const handleTaken = async (e) => {
            const { id } = e.detail;
            dispatch({ type: 'MARK_COMPLETED', payload: id });
            if (apiAvailable && id) {
                try { await axios.patch(`${API_URL}/reminders/${id}/taken`); } catch (_) { }
            }
        };
        window.addEventListener('medsuree-reminder-taken', handleTaken);
        return () => window.removeEventListener('medsuree-reminder-taken', handleTaken);
    }, [apiAvailable]);

    // ── CRUD operations ────────────────────────────────────────────────────
    const addReminder = useCallback(async (reminderData) => {
        if (apiAvailable) {
            try {
                const { data } = await axios.post(`${API_URL}/reminders`, reminderData);
                const reminder = { ...data, id: data._id, status: getStatus(data) };
                dispatch({ type: 'ADD', payload: reminder });
                return reminder;
            } catch (err) {
                console.warn('[ReminderContext] API add failed, saving locally:', err.message);
            }
        }
        // LocalStorage fallback
        const reminder = { ...reminderData, id: crypto.randomUUID(), status: 'upcoming', createdAt: new Date().toISOString() };
        dispatch({ type: 'ADD', payload: reminder });
        return reminder;
    }, [apiAvailable]);

    const updateReminder = useCallback(async (updatedReminder) => {
        const id = updatedReminder._id || updatedReminder.id;
        cancelReminder(id);
        const refreshed = { ...updatedReminder, status: getStatus(updatedReminder) };

        if (apiAvailable && updatedReminder._id) {
            try {
                const { data } = await axios.put(`${API_URL}/reminders/${id}`, updatedReminder);
                dispatch({ type: 'UPDATE', payload: { ...data, id: data._id, status: getStatus(data) } });
                return;
            } catch (err) {
                console.warn('[ReminderContext] API update failed:', err.message);
            }
        }
        dispatch({ type: 'UPDATE', payload: refreshed });
    }, [apiAvailable]);

    const deleteReminder = useCallback(async (id) => {
        cancelReminder(id);
        if (apiAvailable) {
            try {
                await axios.delete(`${API_URL}/reminders/${id}`);
            } catch (err) {
                console.warn('[ReminderContext] API delete failed:', err.message);
            }
        }
        dispatch({ type: 'DELETE', payload: id });
    }, [apiAvailable]);

    const markCompleted = useCallback(async (id) => {
        dispatch({ type: 'MARK_COMPLETED', payload: id });
        if (apiAvailable) {
            try { await axios.patch(`${API_URL}/reminders/${id}/taken`); } catch (_) { }
        }
    }, [apiAvailable]);

    // ── Derived stats ──────────────────────────────────────────────────────
    const stats = useMemo(() => ({
        total: reminders.length,
        upcoming: reminders.filter(r => getStatus(r) === 'upcoming').length,
        completed: reminders.filter(r => r.status === 'completed').length,
        missed: reminders.filter(r => getStatus(r) === 'missed').length,
    }), [reminders]);

    const value = useMemo(() => ({
        reminders,
        stats,
        addReminder,
        updateReminder,
        deleteReminder,
        markCompleted,
        apiAvailable
    }), [reminders, stats, addReminder, updateReminder, deleteReminder, markCompleted, apiAvailable]);

    return (
        <ReminderContext.Provider value={value}>
            {children}
        </ReminderContext.Provider>
    );
};

export const useReminders = () => {
    const ctx = useContext(ReminderContext);
    if (!ctx) throw new Error('useReminders must be used inside ReminderProvider');
    return ctx;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getNextDate(reminder) {
    const base = new Date(`${reminder.date}T${reminder.time}`);
    if (reminder.repeat === 'daily') base.setDate(base.getDate() + 1);
    else if (reminder.repeat === 'weekly') base.setDate(base.getDate() + 7);
    else if (reminder.repeat === 'custom' && reminder.intervalDays > 0) base.setDate(base.getDate() + Number(reminder.intervalDays));
    else return null;
    return base.toISOString().split('T')[0];
}
