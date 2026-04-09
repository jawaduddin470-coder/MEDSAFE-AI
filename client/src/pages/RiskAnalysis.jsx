import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle, ShieldAlert, RefreshCw, Activity, Zap, ShieldCheck, Info, ChevronRight, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { API_URL as API_BASE } from '../config/apiConfig';

const RiskAnalysis = () => {
    const { t } = useLanguage();
    const [medications, setMedications] = useState([]);
    const [auditData, setAuditData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMedications();
    }, []);

    const fetchMedications = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_BASE}/medications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMedications(data);
        } catch (err) {
            console.error(err);
        }
    };

    const runDeepAudit = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            // Using the more comprehensive safety audit endpoint
            const { data } = await axios.post(`${API_BASE}/safety/audit`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAuditData(data);
        } catch (err) {
            console.error(err);
            setError('Failed to connect to Intelligence Engine. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getRiskStyles = (level) => {
        switch (level) {
            case 'High': return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: <ShieldAlert size={32} /> };
            case 'Moderate': return { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: <AlertTriangle size={32} /> };
            default: return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: <ShieldCheck size={32} /> };
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-24">
            {/* Hero Header */}
            <div className="relative py-16 px-10 rounded-[4rem] overflow-hidden text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-emerald-400/10 backdrop-blur-3xl -z-10" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] -z-10 animate-pulse" />

                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-[10px] font-black uppercase tracking-[0.4em] mb-8 animate-fadeIn">
                    <Activity size={14} className="animate-pulse" /> Clinical Safety Engine
                </div>

                <h1 className="text-6xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic leading-[0.9] mb-6">
                    Risk <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Intelligence</span>
                </h1>

                <p className="max-w-2xl mx-auto text-gray-500 dark:text-gray-400 font-medium text-lg leading-relaxed mb-12">
                    Our AI cross-references your entire medication profile against global clinical databases to detect interactions, dosage conflicts, and safety risks.
                </p>

                <div className="flex flex-col items-center gap-6">
                    <button
                        onClick={runDeepAudit}
                        disabled={loading || medications.length === 0}
                        className={`group relative flex items-center gap-4 bg-gray-900 dark:bg-white text-white dark:text-black px-12 py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-widest transition-all duration-700 shadow-3xl hover:shadow-indigo-500/30 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:grayscale disabled:pointer-events-none`}
                    >
                        {loading ? <RefreshCw size={24} className="animate-spin text-indigo-500" /> : <Zap size={24} className="group-hover:text-amber-400 transition-colors" />}
                        {loading ? 'Initializing Neural Audit' : 'Run Full Safety Audit'}
                    </button>

                    {medications.length < 2 && (
                        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest animate-bounce">
                            <Info size={14} /> Critical Data Required: Add at least 2 medications
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 text-center font-black uppercase tracking-widest text-xs">
                    {error}
                </div>
            )}

            {/* Audit Results */}
            {auditData && (
                <div className="space-y-12 animate-slideUp">
                    {/* Top Stats */}
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="glass-card p-10 rounded-[3.5rem] border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl" />
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Safety Score</p>
                            <div className="flex items-end gap-3">
                                <span className={`text-6xl font-black italic tracking-tighter ${auditData.safetyScore > 80 ? 'text-emerald-500' : auditData.safetyScore > 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                    {auditData.safetyScore}
                                </span>
                                <span className="text-xl font-black text-gray-500 opacity-30 pb-2">/ 100</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full mt-6 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${auditData.safetyScore > 80 ? 'bg-emerald-500' : auditData.safetyScore > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                    style={{ width: `${auditData.safetyScore}%` }}
                                />
                            </div>
                        </div>

                        <div className={`glass-card p-10 rounded-[3.5rem] border-white/5 flex flex-col justify-center relative overflow-hidden group ${getRiskStyles(auditData.riskLevel).bg}`}>
                            <div className="flex items-center gap-5 mb-4">
                                <div className={`${getRiskStyles(auditData.riskLevel).color}`}>
                                    {getRiskStyles(auditData.riskLevel).icon}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Threat Level</p>
                                    <h3 className={`text-3xl font-black uppercase italic tracking-tighter ${getRiskStyles(auditData.riskLevel).color}`}>
                                        {auditData.riskLevel} Risk
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-10 rounded-[3.5rem] border-white/5 relative overflow-hidden group">
                            <TrendingUp className="text-indigo-500/40 absolute -right-4 -bottom-4 w-32 h-32 rotate-12" />
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Meds Monitored</p>
                            <h3 className="text-5xl font-black text-gray-900 dark:text-white italic tracking-tighter">{medications.length}</h3>
                            <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-tight">Active Nodes in Sync</p>
                        </div>
                    </div>

                    {/* Alerts & Recommendations */}
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Specific Alerts */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-widest flex items-center gap-3">
                                <ShieldAlert size={20} className="text-indigo-500" /> Critical Warnings
                            </h3>
                            {auditData.alerts.length === 0 ? (
                                <div className="glass-card p-12 rounded-[3rem] border-white/5 border-dashed border-2 flex flex-col items-center justify-center text-center opacity-70">
                                    <ShieldCheck size={48} className="text-emerald-500 mb-4" />
                                    <h4 className="font-black text-white uppercase italic tracking-widest">No Interaction Threats</h4>
                                    <p className="text-xs text-gray-500 mt-2 uppercase font-bold">Neural scan completed with zero critical flags</p>
                                </div>
                            ) : (
                                auditData.alerts.map((alert, idx) => (
                                    <div key={idx} className="glass-card p-8 rounded-[3rem] border-white/5 relative overflow-hidden group hover:bg-white/[0.03] transition-all duration-500 shadow-xl">
                                        <div className={`absolute left-0 top-0 h-full w-2 ${alert.severity === 'High' ? 'bg-red-500' : 'bg-amber-500'}`} />
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${alert.severity === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                {alert.severity} Priority
                                            </span>
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest opacity-40">{alert.type}</span>
                                        </div>
                                        <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">{alert.message}</h4>
                                        <p className="text-sm text-gray-500 font-medium leading-relaxed">{alert.detail}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Recommendations */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-widest flex items-center gap-3">
                                <Zap size={20} className="text-indigo-500" /> Actionable Insights
                            </h3>
                            <div className="glass-card p-2 rounded-[3.5rem] border-white/5 overflow-hidden">
                                {auditData.recommendations.map((rec, idx) => (
                                    <div key={idx} className="p-8 flex items-start gap-6 hover:bg-white/[0.03] transition-colors border-b last:border-b-0 border-white/5 group">
                                        <div className="shrink-0 w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500">
                                            <ChevronRight size={24} />
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 font-bold leading-relaxed">{rec}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="p-8 rounded-[3rem] bg-indigo-600 shadow-2xl shadow-indigo-600/30 flex items-center justify-between group cursor-pointer hover:scale-[1.02] transition-all duration-500" onClick={() => window.dispatchEvent(new Event('toggle-assistant'))}>
                                <div className="space-y-1">
                                    <h4 className="text-white font-black uppercase italic tracking-tight">Need further clarification?</h4>
                                    <p className="text-indigo-100/60 text-[10px] font-black uppercase tracking-widest">Ask our Neural Shield Assistant</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20 text-white group-hover:rotate-12 transition-transform">
                                    <Activity size={20} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="max-w-3xl mx-auto p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 backdrop-blur-sm">
                        <div className="flex items-start gap-4 text-amber-500/60 font-black uppercase tracking-widest text-[9px] leading-relaxed italic">
                            <AlertTriangle size={16} className="shrink-0" />
                            <p>
                                Clinical Disclaimer: Risk Intelligence results are AI-generated based on global health datasets. This tool provides awareness, NOT medical advice. Individual biology varies. Do NOT alter prescriptions without direct clinical supervision.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiskAnalysis;
