import React, { useState, useEffect, useRef } from 'react';
import { X, Bell, CheckCircle, Clock, Volume2, VolumeX } from 'lucide-react';

/**
 * ReminderAlertModal — full-screen modal popup when a reminder fires.
 * Listens for the custom event: 'medsuree-reminder-alert'
 */
const ReminderAlertModal = () => {
    const [reminder, setReminder] = useState(null);
    const [muted, setMuted] = useState(false);
    const audioCtxRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        const handleAlert = (e) => {
            setReminder(e.detail);
            startAlarmLoop();
        };

        window.addEventListener('medsuree-reminder-alert', handleAlert);
        return () => {
            window.removeEventListener('medsuree-reminder-alert', handleAlert);
            stopAlarm();
        };
    }, []);

    // Play alarm sound in a loop every 4 seconds
    function startAlarmLoop() {
        playBeeps();
        intervalRef.current = setInterval(playBeeps, 4000);
    }

    function stopAlarm() {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (audioCtxRef.current) {
            try { audioCtxRef.current.close(); } catch (_) { }
            audioCtxRef.current = null;
        }
    }

    function playBeeps() {
        if (muted) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            audioCtxRef.current = ctx;

            const playNote = (freq, start, dur) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, start);
                gain.gain.setValueAtTime(0.5, start);
                gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
                osc.start(start);
                osc.stop(start + dur);
            };

            const t = ctx.currentTime;
            playNote(660, t, 0.15);
            playNote(880, t + 0.2, 0.15);
            playNote(1100, t + 0.4, 0.2);
        } catch (_) { }
    }

    const handleTaken = () => {
        stopAlarm();
        setReminder(null);
        // Dispatch taken event for ReminderContext
        if (reminder?.id || reminder?._id) {
            window.dispatchEvent(new CustomEvent('medsuree-reminder-taken', {
                detail: { id: reminder.id || reminder._id }
            }));
        }
    };

    const handleSnooze = () => {
        stopAlarm();
        const snoozeReminder = { ...reminder };
        setReminder(null);
        // Re-fire alert after 15 minutes
        setTimeout(() => {
            window.dispatchEvent(new CustomEvent('medsuree-reminder-alert', {
                detail: snoozeReminder
            }));
        }, 15 * 60 * 1000);
    };

    const handleDismiss = () => {
        stopAlarm();
        setReminder(null);
    };

    if (!reminder) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
                onClick={handleDismiss}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl shadow-indigo-500/30 animate-slide-up">
                {/* Animated top bar */}
                <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400 animate-pulse" />

                <div className="bg-white dark:bg-gray-900 border border-white/10 p-8">
                    {/* Icon & Title */}
                    <div className="text-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-indigo-500/10 border-2 border-indigo-500/30 flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <Bell size={36} className="text-indigo-500" />
                        </div>
                        <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">⏰ Medication Alert</p>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">
                            {reminder.medicineName}
                        </h2>
                        {reminder.dosage && (
                            <p className="text-gray-500 dark:text-gray-400 font-bold mt-2 text-sm uppercase tracking-wider">
                                Dosage: {reminder.dosage}
                            </p>
                        )}
                        <div className="flex items-center justify-center gap-2 mt-3 text-xs font-bold text-gray-500">
                            <Clock size={13} />
                            <span>
                                {reminder.time && new Date(`2000-01-01T${reminder.time}`).toLocaleTimeString('en-IN', {
                                    hour: '2-digit', minute: '2-digit', hour12: true
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleTaken}
                            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-lg uppercase tracking-wider hover:from-indigo-500 hover:to-blue-500 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105"
                        >
                            <CheckCircle size={22} /> Mark as Taken
                        </button>

                        <button
                            onClick={handleSnooze}
                            className="w-full py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-sm uppercase tracking-wider hover:bg-amber-500/20 transition-all"
                        >
                            😴 Snooze 15 minutes
                        </button>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setMuted(!muted)}
                                className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                            >
                                {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                {muted ? 'Unmute' : 'Mute'}
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="flex-1 py-3 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                            >
                                <X size={16} /> Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReminderAlertModal;
