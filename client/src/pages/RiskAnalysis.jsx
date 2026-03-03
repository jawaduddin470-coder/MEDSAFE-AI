import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle, ShieldAlert, RefreshCw, Activity } from 'lucide-react';

const RiskAnalysis = () => {
    const [medications, setMedications] = useState([]);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMedications();
    }, []);

    const fetchMedications = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/medications`);
            setMedications(data);
        } catch (error) {
            console.error(error);
        }
    };

    const runAnalysis = async () => {
        if (medications.length < 2) {
            alert('You need at least 2 medications to check for interactions.');
            return;
        }

        setLoading(true);
        try {
            const medNames = medications.map(m => m.name);
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/analysis/check`, { medications: medNames });
            setAnalysisResult(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level) => {
        switch (level) {
            case 'High': return 'bg-red-50 border-red-200 text-red-800';
            case 'Moderate': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            default: return 'bg-green-50 border-green-200 text-green-800';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-4">
                <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">
                    Risk <span className="text-indigo-600 dark:text-indigo-400">Analysis</span>
                </h1>
                <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">Scientific cross-referencing engine</p>
            </div>

            {/* Action Section */}
            <div className="glass-card p-10 rounded-[2.5rem] border-white/5 relative overflow-hidden text-center space-y-8 group">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-purple-500/5 opacity-50" />
                <div className="flex flex-wrap justify-center gap-3 relative z-10">
                    {medications.map((med, idx) => (
                        <span key={idx} className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-5 py-2 rounded-xl text-xs font-black border border-indigo-500/20 uppercase tracking-widest">
                            {med.name}
                        </span>
                    ))}
                </div>

                <button
                    onClick={runAnalysis}
                    disabled={loading || medications.length === 0}
                    className={`relative z-10 btn-primary !px-12 !py-5 font-black text-sm tracking-widest uppercase transition-all duration-500 hover:scale-105 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? <RefreshCw className="animate-spin mr-3" /> : <ShieldAlert className="mr-3" />}
                    {loading ? 'Crunching Data...' : 'Start Safety Audit'}
                </button>

                {medications.length < 2 && (
                    <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                        <AlertTriangle size={14} /> Add {2 - medications.length} more medication{2 - medications.length !== 1 ? 's' : ''} to enable audit.
                    </p>
                )}
            </div>

            {/* Results Section */}
            {analysisResult && (
                <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
                    {/* Score Card */}
                    <div className="glass-card p-10 rounded-[2.5rem] border-white/5 relative overflow-hidden group shadow-2xl">
                        <div className={`absolute left-0 top-0 h-full w-2 ${analysisResult.riskLevel === 'High' ? 'bg-red-500' : analysisResult.riskLevel === 'Moderate' ? 'bg-amber-500' : 'bg-green-500'}`} />
                        <div className="flex items-start gap-6">
                            <div className={`${analysisResult.riskLevel === 'High' ? 'text-red-500' : 'text-indigo-500'} mt-1`}>
                                {analysisResult.riskLevel === 'High' ? <ShieldAlert size={48} /> : <CheckCircle size={48} />}
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase mb-3">Audit: {analysisResult.riskLevel} Risk</h2>
                                <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{analysisResult.summary}</p>
                            </div>
                        </div>
                    </div>

                    {/* Interactions List */}
                    {analysisResult.interactions.length > 0 && (
                        <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden">
                            <div className="bg-indigo-50 dark:bg-white/5 px-8 py-5 border-b border-indigo-100 dark:border-white/5">
                                <h3 className="font-black text-indigo-600 dark:text-white text-sm uppercase tracking-widest">Identified Interactions</h3>
                            </div>
                            <div className="divide-y divide-white/5">
                                {analysisResult.interactions.map((interaction, idx) => (
                                    <div key={idx} className="p-8 hover:bg-white/[0.03] transition-colors group">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">{interaction.med1}</span>
                                                <span className="text-indigo-500/40 font-black">+</span>
                                                <span className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">{interaction.med2}</span>
                                            </div>
                                            <span className={`text-[10px] px-3 py-1 rounded-lg font-black uppercase tracking-widest border ${interaction.severity === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                {interaction.severity}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm leading-relaxed font-medium">
                                            {interaction.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Disclaimer */}
                    <div className="bg-amber-500/5 text-amber-500 p-6 rounded-2xl border border-amber-500/10 flex items-start gap-4">
                        <AlertTriangle size={20} className="mt-0.5 shrink-0" />
                        <p className="text-xs font-bold leading-relaxed">
                            <span className="uppercase tracking-widest">Medical Disclaimer:</span> This analysis is computer-generated for educational awareness and may not cover all interactions. Risk factors vary by individual. Always consult your primary care physician before making changes.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiskAnalysis;
