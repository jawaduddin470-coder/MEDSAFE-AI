import React, { useEffect, useState } from 'react';
import { BellRing, X } from 'lucide-react';

const MedSureeReminderBanner = () => {
    const [alertData, setAlertData] = useState(null);

    useEffect(() => {
        const handleAlert = (e) => {
            setAlertData(e.detail);
            // Auto close after 10s if not interacted
            setTimeout(() => {
                setAlertData(null);
            }, 10000);
        };

        window.addEventListener('medsuree-reminder-alert', handleAlert);
        return () => window.removeEventListener('medsuree-reminder-alert', handleAlert);
    }, []);

    if (!alertData) return null;

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce-in w-full max-w-md px-4">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl p-4 shadow-2xl border border-white/20 text-white flex items-start gap-4">
                <div className="bg-white/20 rounded-full p-3 flex-shrink-0 animate-pulse">
                    <BellRing className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Time for Medication</h3>
                    <p className="font-medium text-white/90">{alertData.medicineName} {alertData.dosage ? `(${alertData.dosage})` : ''}</p>
                </div>
                <button
                    onClick={() => setAlertData(null)}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default MedSureeReminderBanner;
