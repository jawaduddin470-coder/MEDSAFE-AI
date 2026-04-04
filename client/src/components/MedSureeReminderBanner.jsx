import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, CheckCircle, Volume2 } from 'lucide-react';

/**
 * MedSureeReminderBanner — sticky top banner shown when a reminder fires.
 * Incorporates Neural Ping (Audio) for maximum safety awareness.
 */
const MedSureeReminderBanner = () => {
    const [alerts, setAlerts] = useState([]);

    // Professional Audio Ping using Web Audio API
    const playNeuralPing = useCallback(() => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;

            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5); // A4

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {
            console.warn('Audio feedback blocked by browser policy:', e);
        }
    }, []);

    useEffect(() => {
        const handleAlert = (e) => {
            const reminder = e.detail;
            const alertId = Date.now();
            setAlerts(prev => [...prev, { ...reminder, alertId }]);

            // Trigger Neural Ping
            playNeuralPing();

            // Auto-dismiss banner after 45 seconds (increased for safety)
            setTimeout(() => {
                setAlerts(prev => prev.filter(a => a.alertId !== alertId));
            }, 45_000);
        };

        window.addEventListener('medsuree-reminder-alert', handleAlert);
        return () => window.removeEventListener('medsuree-reminder-alert', handleAlert);
    }, [playNeuralPing]);

    const dismiss = (alertId) => {
        setAlerts(prev => prev.filter(a => a.alertId !== alertId));
    };

    if (alerts.length === 0) return null;

    return (
        <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-4 max-w-sm w-full pointer-events-none">
            {alerts.map((alert) => (
                <div
                    key={alert.alertId}
                    className="pointer-events-auto group relative flex items-center gap-5 p-6 rounded-[2.5rem] bg-indigo-600 dark:bg-indigo-700 text-white shadow-4xl shadow-indigo-500/40 border border-indigo-400/30 animate-slide-up overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                        <Bell size={24} className="animate-bounce" />
                    </div>

                    <div className="flex-1 min-w-0 relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                            <Volume2 size={12} className="text-indigo-200" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">Neural Alert</p>
                        </div>
                        <p className="font-black text-lg text-white truncate italic uppercase leading-tight">{alert.medicineName}</p>
                        <p className="text-xs text-indigo-100 font-bold opacity-80 uppercase tracking-widest">{alert.dosage || 'Schedule Sync'}</p>
                    </div>

                    <button
                        onClick={() => dismiss(alert.alertId)}
                        className="relative z-10 p-3 rounded-2xl bg-black/20 hover:bg-black/40 text-white/50 hover:text-white transition-all active:scale-90"
                    >
                        <X size={18} />
                    </button>

                    <div className="absolute bottom-0 left-0 h-1 bg-white/30 animate-progress-shrink" style={{ width: '100%', animationDuration: '45s', animationTimingFunction: 'linear' }} />
                </div>
            ))}
        </div>
    );
};

export default MedSureeReminderBanner;
