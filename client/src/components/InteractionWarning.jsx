import React from 'react';
import { AlertTriangle, X, AlertCircle, Info } from 'lucide-react';

/**
 * InteractionWarning — shows colored warning cards for detected drug interactions.
 * Props:
 *   warnings: array of { drug1, drug2, severity, message, detail }
 *   onDismiss: optional callback
 */
const InteractionWarning = ({ warnings = [], onDismiss }) => {
    if (!warnings || warnings.length === 0) return null;

    const severityConfig = {
        danger: {
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-300 dark:border-red-700',
            icon: <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />,
            badge: 'bg-red-500 text-white',
            label: '🚨 HIGH RISK',
        },
        warning: {
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            border: 'border-amber-300 dark:border-amber-700',
            icon: <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />,
            badge: 'bg-amber-500 text-white',
            label: '⚠ WARNING',
        },
        info: {
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-300 dark:border-blue-700',
            icon: <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />,
            badge: 'bg-blue-500 text-white',
            label: 'ℹ INFO',
        },
    };

    return (
        <div className="space-y-3 my-4">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">
                ⚠ Medication Interaction Warning{warnings.length > 1 ? 's' : ''}
            </p>
            {warnings.map((w, i) => {
                const cfg = severityConfig[w.severity] || severityConfig.warning;
                return (
                    <div key={i} className={`flex gap-3 p-4 rounded-2xl border ${cfg.bg} ${cfg.border}`}>
                        {cfg.icon}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${cfg.badge}`}>
                                    {cfg.label}
                                </span>
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                    {w.drug1} + {w.drug2}
                                </span>
                            </div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">
                                {w.message}
                            </p>
                            {w.detail && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">
                                    {w.detail}
                                </p>
                            )}
                        </div>
                        {onDismiss && (
                            <button
                                onClick={() => onDismiss(i)}
                                className="p-1.5 rounded-xl hover:bg-black/10 transition-colors flex-shrink-0"
                            >
                                <X size={14} className="text-gray-500" />
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default InteractionWarning;
