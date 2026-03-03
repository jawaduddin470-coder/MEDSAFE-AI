import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { scheduleReminder, cancelReminder } from '../utils/reminderScheduler';

// ─── Constants ───────────────────────────────────────────────────────────────
const STORAGE_KEY = 'medsafe_reminders';

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
        case 'LOAD':
            return action.payload;

        case 'ADD':
            return [action.payload, ...state];

        case 'UPDATE':
            return state.map((r) => (r.id === action.payload.id ? action.payload : r));

        case 'DELETE':
            return state.filter((r) => r.id !== action.payload);

        case 'MARK_COMPLETED':
            return state.map((r) =>
                r.id === action.payload ? { ...r, status: 'completed' } : r
            );

        case 'RECALCULATE_STATUS':
            return state.map((r) => ({
                ...r,
                status: r.status === 'completed' ? 'completed' : getStatus(r),
            }));

        default:
            return state;
    }
};

// ─── Context ──────────────────────────────────────────────────────────────────
const ReminderContext = createContext(null);

export const ReminderProvider = ({ children }) => {
    const [reminders, dispatch] = useReducer(reminderReducer, []);

    // Load from localStorage once on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            const loaded = stored ? JSON.parse(stored) : [];
            // Recalculate statuses after reload
            const refreshed = loaded.map((r) => ({
                ...r,
                status: r.status === 'completed' ? 'completed' : getStatus(r),
            }));
            dispatch({ type: 'LOAD', payload: refreshed });
        } catch {
            dispatch({ type: 'LOAD', payload: [] });
        }
    }, []);

    // Persist to localStorage whenever reminders change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    }, [reminders]);

    // Re-schedule timers and recalculate statuses every 30 seconds
    useEffect(() => {
        const tick = () => dispatch({ type: 'RECALCULATE_STATUS' });
        const interval = setInterval(tick, 30_000);
        return () => clearInterval(interval);
    }, []);

    // ── Schedule notification when a new upcoming reminder is added
    useEffect(() => {
        const upcomingReminders = reminders.filter(r => r.status === 'upcoming');

        upcomingReminders.forEach((r) => {
            scheduleReminder(r, () => {
                dispatch({ type: 'MARK_COMPLETED', payload: r.id });
                // Handle recurring reminders
                if (r.repeat !== 'none') {
                    const nextDate = getNextDate(r);
                    if (nextDate) {
                        const nextReminder = {
                            ...r,
                            id: crypto.randomUUID(),
                            date: nextDate,
                            status: 'upcoming',
                            createdAt: new Date().toISOString(),
                        };
                        dispatch({ type: 'ADD', payload: nextReminder });
                    }
                }
            });
        });

        return () => {
            // Only cancel if they are no longer in the list or changed
            reminders.forEach((r) => cancelReminder(r.id));
        };
    }, [reminders]); // Watch the entire array for deep changes (edits)

    // ── CRUD operations ──────────────────────────────────
    const addReminder = useCallback((reminderData) => {
        const reminder = {
            ...reminderData,
            id: crypto.randomUUID(),
            status: 'upcoming',
            createdAt: new Date().toISOString(),
        };
        dispatch({ type: 'ADD', payload: reminder });
        return reminder;
    }, []);

    const updateReminder = useCallback((updatedReminder) => {
        cancelReminder(updatedReminder.id);
        const refreshed = {
            ...updatedReminder,
            status: getStatus(updatedReminder),
        };
        dispatch({ type: 'UPDATE', payload: refreshed });
    }, []);

    const deleteReminder = useCallback((id) => {
        cancelReminder(id);
        dispatch({ type: 'DELETE', payload: id });
    }, []);

    const markCompleted = useCallback((id) => {
        dispatch({ type: 'MARK_COMPLETED', payload: id });
    }, []);

    // ── Derived stats ────────────────────────────────────
    const stats = {
        total: reminders.length,
        upcoming: reminders.filter((r) => getStatus(r) === 'upcoming').length,
        completed: reminders.filter((r) => r.status === 'completed').length,
        missed: reminders.filter((r) => getStatus(r) === 'missed').length,
    };

    return (
        <ReminderContext.Provider
            value={{ reminders, stats, addReminder, updateReminder, deleteReminder, markCompleted }}
        >
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
    if (reminder.repeat === 'daily') {
        base.setDate(base.getDate() + 1);
    } else if (reminder.repeat === 'weekly') {
        base.setDate(base.getDate() + 7);
    } else if (reminder.repeat === 'custom' && reminder.intervalDays > 0) {
        base.setDate(base.getDate() + Number(reminder.intervalDays));
    } else {
        return null;
    }
    return base.toISOString().split('T')[0];
}
