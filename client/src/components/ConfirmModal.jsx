import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ message, confirmLabel = 'Delete', onConfirm, onCancel }) => {
    // Close on Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onCancel(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onCancel]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-slideUp"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-full">
                        <AlertTriangle size={28} />
                    </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
                    Confirm Delete
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6 leading-relaxed">
                    {message}
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300
                       bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                       rounded-xl transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-white
                       bg-red-600 hover:bg-red-700 rounded-xl transition-colors
                       hover:shadow-lg hover:shadow-red-500/30 active:scale-95"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
