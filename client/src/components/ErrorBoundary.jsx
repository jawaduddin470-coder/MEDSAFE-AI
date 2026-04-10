import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('[MedSuree ErrorBoundary] Caught error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0a0e1a] px-6">
                    <div className="flex flex-col items-center gap-6 max-w-md text-center">
                        <div className="w-20 h-20 rounded-[2rem] bg-red-500/10 flex items-center justify-center text-red-500 text-4xl shadow-xl">
                            ⚠️
                        </div>
                        <div>
                            <h1 className="text-2xl font-black uppercase italic text-gray-900 dark:text-white tracking-tight mb-2">
                                Something went wrong
                            </h1>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                MedSuree encountered an unexpected error. This is usually a temporary issue.
                            </p>
                            {this.state.error?.message && (
                                <p className="mt-3 text-[11px] font-mono text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl px-4 py-2">
                                    {this.state.error.message.substring(0, 120)}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-colors shadow-lg"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}
                                className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-500 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-colors"
                            >
                                Back to Login
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
