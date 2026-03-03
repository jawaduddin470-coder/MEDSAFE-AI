import { sendNotification } from './notificationHelper';

// ─── Active timer registry ────────────────────────────────────────────────────
const activeTimers = new Map(); // reminderId → timeoutId

/**
 * Schedule a reminder to fire at its exact date+time.
 * @param {Object} reminder – reminder object with id, medicineName, dosage, date, time
 * @param {Function} onFire – callback invoked when the timer fires
 */
export function scheduleReminder(reminder, onFire) {
    // Cancel any existing timer for this id
    cancelReminder(reminder.id);

    const now = Date.now();
    const fireAt = new Date(`${reminder.date}T${reminder.time}`).getTime();
    const delay = fireAt - now;

    // Store callback and fire time for the watchdog
    activeTimers.set(reminder.id, {
        timeoutId: null,
        onFire,
        fireAt,
        reminder
    });

    // Only schedule if in the future (allow up to 10s grace for slight drift)
    if (delay <= -10_000) {
        activeTimers.delete(reminder.id);
        return;
    }

    const safeDelay = Math.max(delay, 0);

    // For very long delays, let the watchdog handle it to avoid setTimeout limitations
    if (safeDelay > 3600_000) return;

    const timeoutId = setTimeout(() => {
        triggerReminder(reminder.id);
    }, safeDelay);

    activeTimers.get(reminder.id).timeoutId = timeoutId;
}

/**
 * Common trigger logic for both setTimeout and Watchdog
 */
function triggerReminder(id) {
    const data = activeTimers.get(id);
    if (!data) return;

    const { reminder, onFire } = data;

    activeTimers.delete(id);
    playAlertSound();

    if (Notification.permission === 'granted') {
        sendNotification(
            `💊 Time to take ${reminder.medicineName}`,
            reminder.dosage ? `Dosage: ${reminder.dosage}` : 'Your medication reminder is due.'
        );
    } else {
        // Fallback alert if notifications are blocked
        alert(`💊 MEDSAFE REMINDER: Time to take ${reminder.medicineName}${reminder.dosage ? ` (${reminder.dosage})` : ''}`);
    }

    onFire();
}

/**
 * Watchdog timer that runs every 30 seconds to catch missed reminders 
 * (helps with background tab throttling and long-duration timers)
 */
setInterval(() => {
    const now = Date.now();
    activeTimers.forEach((data, id) => {
        // If reminder is due or slightly past due (up to 2 mins) and hasn't fired
        if (now >= data.fireAt && now - data.fireAt < 120_000) {
            console.log(`Watchdog triggering missed reminder: ${id}`);
            triggerReminder(id);
        }
    });
}, 30_000);

/**
 * Cancel a scheduled reminder.
 */
export function cancelReminder(id) {
    if (activeTimers.has(id)) {
        const data = activeTimers.get(id);
        if (data.timeoutId) clearTimeout(data.timeoutId);
        activeTimers.delete(id);
    }
}

/**
 * Cancel all active timers (e.g. on unmount).
 */
export function cancelAllReminders() {
    activeTimers.forEach((data) => {
        if (data.timeoutId) clearTimeout(data.timeoutId);
    });
    activeTimers.clear();
}

// ─── Alert sound via Web Audio API ───────────────────────────────────────────
function playAlertSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();

        const playBeep = (frequency, startTime, duration) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, startTime);

            gainNode.gain.setValueAtTime(0.4, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        };

        // Three rising beeps
        const t = ctx.currentTime;
        playBeep(660, t, 0.15);
        playBeep(880, t + 0.2, 0.15);
        playBeep(1100, t + 0.4, 0.25);
    } catch (err) {
        // Audio API unavailable – fail silently
        console.warn('Alert sound failed:', err);
    }
}
