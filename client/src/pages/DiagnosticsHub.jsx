/**
 * MedSuree — AI Diagnostics Hub
 * Modules:
 *   1. Medical Report Analyzer
 *   2. X-Ray Authenticity & Misuse Detection
 */

import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import {
    FlaskConical,
    ScanEye,
    UploadCloud,
    FileText,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Loader2,
    Sparkles,
    ShieldAlert,
    ChevronRight,
    RotateCcw,
    Info,
    Zap,
    Activity,
    ImageIcon,
} from 'lucide-react';
import PageTransition from '../components/PageTransition';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCEPTED_REPORT_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
const ACCEPTED_XRAY_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const MAX_FILE_SIZE_MB = 10;

// ─── Utility Helpers ─────────────────────────────────────────────────────────

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
    const map = {
        high: { color: 'bg-red-500/15 text-red-400 border-red-500/30', label: 'HIGH' },
        low: { color: 'bg-amber-500/15 text-amber-400 border-amber-500/30', label: 'LOW' },
        normal: { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', label: 'NORMAL' },
    };
    const cfg = map[status] || map.normal;
    return (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest border ${cfg.color}`}>
            {cfg.label}
        </span>
    );
};

// ─── Risk Level Badge (X-Ray) ─────────────────────────────────────────────────

const RiskBadge = ({ level }) => {
    const map = {
        high:     { color: 'text-red-400 bg-red-500/10 border-red-500/30', icon: <XCircle size={16} /> },
        moderate: { color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: <AlertTriangle size={16} /> },
        low:      { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: <CheckCircle2 size={16} /> },
    };
    const cfg = map[level] || map.low;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${cfg.color}`}>
            {cfg.icon}
        </span>
    );
};

// ─── Upload Card (reusable) ───────────────────────────────────────────────────

function UploadCard({ accept, onFileSelect, file, uploading, icon, title, hint, acceptedLabel }) {
    const inputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) onFileSelect(dropped);
    }, [onFileSelect]);

    const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
    const handleDragLeave = () => setDragOver(false);

    return (
        <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
                ${dragOver
                    ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
                    : file
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : 'border-white/10 bg-white/2 hover:border-indigo-500/50 hover:bg-indigo-500/5'
                }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !uploading && inputRef.current?.click()}
            role="button"
            aria-label="Upload file"
        >
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => e.target.files[0] && onFileSelect(e.target.files[0])}
            />

            {/* Glow blob */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl transition-opacity duration-500
                    ${dragOver ? 'opacity-30 bg-indigo-500' : 'opacity-0'}`} />
            </div>

            {file ? (
                <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                        <CheckCircle2 size={28} className="text-emerald-400" />
                    </div>
                    <div>
                        <p className="font-bold text-white text-sm truncate max-w-[220px]">{file.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatFileSize(file.size)}</p>
                    </div>
                    <p className="text-xs text-indigo-400 font-semibold mt-1">Click to replace file</p>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        {icon}
                    </div>
                    <div>
                        <p className="font-bold text-white text-base">{title}</p>
                        <p className="text-sm text-gray-400 mt-1">{hint}</p>
                        <p className="text-xs text-gray-500 mt-2 font-mono">{acceptedLabel}</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold">
                        <UploadCloud size={16} />
                        Upload File
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ progress, label }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{label}</span>
                <span className="text-xs text-indigo-400 font-bold">{progress}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, #6366f1, #3b82f6)',
                        boxShadow: '0 0 10px rgba(99,102,241,0.5)',
                    }}
                />
            </div>
        </div>
    );
}

// ─── Processing Overlay ───────────────────────────────────────────────────────

function ProcessingState({ message }) {
    return (
        <div className="flex flex-col items-center justify-center gap-6 py-16">
            {/* Animated rings */}
            <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-3 border-4 border-blue-500/30 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={20} className="text-indigo-400 animate-pulse" />
                </div>
            </div>
            <div className="text-center">
                <p className="text-white font-bold text-lg">{message}</p>
                <p className="text-gray-400 text-sm mt-1">This may take a few seconds…</p>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE 1: MEDICAL REPORT ANALYZER
// ═══════════════════════════════════════════════════════════════════════════════

function ReportAnalyzer() {
    const [file, setFile] = useState(null);
    const [state, setState] = useState('idle'); // idle | uploading | processing | result | error
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    // ── Handle file selection ──────────────────────────────────────────────────
    const handleFileSelect = (selectedFile) => {
        setErrorMsg('');
        setResult(null);
        setState('idle');

        if (!ACCEPTED_REPORT_TYPES.includes(selectedFile.type)) {
            setErrorMsg('Invalid file type. Please upload a JPG, PNG, or PDF.');
            return;
        }
        if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setErrorMsg(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
            return;
        }
        setFile(selectedFile);
    };

    // ── Analyze report ─────────────────────────────────────────────────────────
    const handleAnalyze = async (isDemoMode = false) => {
        if (!isDemoMode && !file) return;

        setErrorMsg('');
        setState('uploading');
        setProgress(0);

        // Simulate upload progress
        const uploadTimer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 80) { clearInterval(uploadTimer); return 80; }
                return prev + Math.random() * 15;
            });
        }, 200);

        try {
            let base64Image = null;
            if (!isDemoMode && file) {
                base64Image = await fileToBase64(file);
            }

            clearInterval(uploadTimer);
            setProgress(100);
            setState('processing');

            const token = localStorage.getItem('token');
            const response = await axios.post(
                '/api/diagnostics/analyze-report',
                {
                    image: base64Image,
                    filename: file?.name || 'demo-report.jpg',
                    isDemoMode,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 60000,
                }
            );

            setResult(response.data);
            setState('result');
        } catch (err) {
            clearInterval(uploadTimer);
            console.error('Report analysis error:', err);
            setErrorMsg(
                err.response?.data?.message ||
                'Could not analyze the report. Please try again or use Demo Mode.'
            );
            setState('error');
        }
    };

    const handleReset = () => {
        setFile(null);
        setState('idle');
        setResult(null);
        setErrorMsg('');
        setProgress(0);
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">

            {/* Header card */}
            <div className="glass-card rounded-2xl p-6 border border-white/8">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                        <FileText size={24} className="text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Medical Report Analyzer</h2>
                        <p className="text-gray-400 text-sm mt-1">
                            Upload a blood report, lab result, or medical document. Our AI extracts key parameters,
                            highlights abnormal values, and gives you a plain-English summary.
                        </p>
                    </div>
                </div>
            </div>

            {/* Upload area — shown in idle/error states */}
            {(state === 'idle' || state === 'error') && (
                <div className="space-y-4">
                    <UploadCard
                        accept={ACCEPTED_REPORT_TYPES.join(',')}
                        onFileSelect={handleFileSelect}
                        file={file}
                        uploading={false}
                        icon={<UploadCloud size={30} className="text-indigo-400" />}
                        title="Drag & drop your medical report"
                        hint="Or click to browse your files"
                        acceptedLabel="JPG · PNG · PDF — Max 10MB"
                    />

                    {errorMsg && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fadeIn">
                            <AlertTriangle size={18} className="flex-shrink-0" />
                            {errorMsg}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            id="btn-analyze-report"
                            onClick={() => handleAnalyze(false)}
                            disabled={!file}
                            className={`btn-primary flex-1 flex items-center justify-center gap-2 !py-3.5 transition-all
                                ${!file ? 'opacity-40 cursor-not-allowed' : 'hover-glow'}`}
                        >
                            <Activity size={18} />
                            Analyze Report
                        </button>
                        <button
                            id="btn-demo-report"
                            onClick={() => handleAnalyze(true)}
                            className="btn-secondary flex-1 flex items-center justify-center gap-2 !py-3.5 hover:border-indigo-500/40 hover:text-indigo-400"
                        >
                            <Zap size={18} className="text-indigo-400" />
                            Try Sample Report
                        </button>
                    </div>
                </div>
            )}

            {/* Uploading state */}
            {state === 'uploading' && (
                <div className="glass-card rounded-2xl p-8 border border-white/8 space-y-4 animate-fadeIn">
                    <p className="text-white font-bold text-center">Uploading report…</p>
                    <ProgressBar progress={Math.round(progress)} label="Uploading" />
                </div>
            )}

            {/* Processing state */}
            {state === 'processing' && (
                <div className="glass-card rounded-2xl border border-white/8 animate-fadeIn">
                    <ProcessingState message="Analyzing report with AI…" />
                </div>
            )}

            {/* Result state */}
            {state === 'result' && result && (
                <div className="space-y-5 animate-fadeIn">

                    {/* Demo / Warning banner */}
                    {(result.demoMode || result.warning) && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm">
                            <Info size={18} className="flex-shrink-0 text-indigo-400" />
                            <span>
                                {result.warning
                                    ? result.warning
                                    : 'Showing demo results. Upload a real report for personalized analysis.'}
                            </span>
                        </div>
                    )}

                    {/* Key Parameters Table */}
                    {result.parameters && result.parameters.length > 0 && (
                        <div className="glass-card rounded-2xl border border-white/8 overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5">
                                <h3 className="text-white font-bold text-base flex items-center gap-2">
                                    <Activity size={18} className="text-indigo-400" />
                                    Key Parameters
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="text-left px-6 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wider">Parameter</th>
                                            <th className="text-left px-4 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wider">Value</th>
                                            <th className="text-left px-4 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wider">Normal Range</th>
                                            <th className="text-left px-4 py-3 text-gray-400 font-semibold text-xs uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.parameters.map((p, i) => (
                                            <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors table-row-hover">
                                                <td className="px-6 py-3.5 text-white font-semibold">{p.name}</td>
                                                <td className={`px-4 py-3.5 font-bold ${
                                                    p.status === 'high' ? 'text-red-400' :
                                                    p.status === 'low' ? 'text-amber-400' :
                                                    'text-emerald-400'
                                                }`}>{p.value}</td>
                                                <td className="px-4 py-3.5 text-gray-400">{p.normal}</td>
                                                <td className="px-4 py-3.5">
                                                    <StatusBadge status={p.status} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Abnormal Highlights */}
                    {result.abnormal && result.abnormal.length > 0 && (
                        <div className="glass-card rounded-2xl border border-red-500/20 overflow-hidden">
                            <div className="px-6 py-4 border-b border-red-500/10 bg-red-500/5">
                                <h3 className="text-red-400 font-bold text-base flex items-center gap-2">
                                    <AlertTriangle size={18} />
                                    Abnormal Values
                                </h3>
                            </div>
                            <div className="divide-y divide-white/5">
                                {result.abnormal.map((item, i) => (
                                    <div key={i} className="px-6 py-4 flex items-start gap-4 hover:bg-red-500/3 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-red-500/15 border border-red-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <AlertTriangle size={15} className="text-red-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-white font-bold text-sm">{item.name}</span>
                                                <span className="text-red-400 font-bold text-sm">{item.value}</span>
                                            </div>
                                            <p className="text-gray-400 text-xs mt-1 leading-relaxed">{item.reason}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Summary */}
                    {result.summary && (
                        <div className="glass-card rounded-2xl border border-indigo-500/20 overflow-hidden">
                            <div className="px-6 py-4 border-b border-indigo-500/10 bg-indigo-500/5">
                                <h3 className="text-indigo-400 font-bold text-base flex items-center gap-2">
                                    <Sparkles size={18} />
                                    AI Summary
                                </h3>
                            </div>
                            <div className="px-6 py-5">
                                <p className="text-gray-300 text-sm leading-relaxed">{result.summary}</p>
                            </div>
                        </div>
                    )}

                    {/* Disclaimer */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/15 text-amber-300/80 text-xs leading-relaxed">
                        <ShieldAlert size={16} className="flex-shrink-0 mt-0.5 text-amber-400" />
                        <span>{result.disclaimer || 'This analysis is for informational purposes only. Always consult a qualified healthcare professional.'}</span>
                    </div>

                    {/* Reset button */}
                    <button
                        id="btn-reset-report"
                        onClick={handleReset}
                        className="btn-secondary w-full flex items-center justify-center gap-2 hover:border-indigo-500/40"
                    >
                        <RotateCcw size={16} />
                        Analyze Another Report
                    </button>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MODULE 2: X-RAY AUTHENTICITY CHECKER
// ═══════════════════════════════════════════════════════════════════════════════

// Similarity Meter
function SimilarityMeter({ value }) {
    const color = value > 90 ? '#ef4444' : value >= 70 ? '#f59e0b' : '#10b981';
    const circumference = 2 * Math.PI * 36;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="relative w-24 h-24 mx-auto">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
                <circle
                    cx="40" cy="40" r="36"
                    fill="none"
                    stroke={color}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 6px ${color}99)` }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-white leading-none">{value}%</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Similar</span>
            </div>
        </div>
    );
}

function XrayChecker() {
    const [file, setFile] = useState(null);
    const [state, setState] = useState('idle');
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const handleFileSelect = (selectedFile) => {
        setErrorMsg('');
        setResult(null);
        setState('idle');

        if (!ACCEPTED_XRAY_TYPES.includes(selectedFile.type)) {
            setErrorMsg('Invalid file type. Please upload a JPG or PNG image.');
            return;
        }
        if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setErrorMsg(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`);
            return;
        }
        setFile(selectedFile);
    };

    const handleCheck = async (isDemoMode = false) => {
        if (!isDemoMode && !file) return;

        setErrorMsg('');
        setState('uploading');
        setProgress(0);

        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 75) { clearInterval(timer); return 75; }
                return prev + Math.random() * 20;
            });
        }, 180);

        try {
            let base64Image = null;
            if (!isDemoMode && file) {
                base64Image = await fileToBase64(file);
            }

            clearInterval(timer);
            setProgress(100);
            setState('processing');

            const token = localStorage.getItem('token');
            const response = await axios.post(
                '/api/diagnostics/check-xray',
                {
                    image: base64Image,
                    filename: file?.name || 'demo-xray.jpg',
                    isDemoMode,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 30000,
                }
            );

            setResult(response.data);
            setState('result');
        } catch (err) {
            clearInterval(timer);
            console.error('X-ray check error:', err);
            setErrorMsg(
                err.response?.data?.message ||
                'Could not process the X-ray. Please try again or use Demo Mode.'
            );
            setState('error');
        }
    };

    const handleReset = () => {
        setFile(null);
        setState('idle');
        setResult(null);
        setErrorMsg('');
        setProgress(0);
    };

    const riskColors = {
        high: { ring: 'ring-red-500/30 bg-red-500/5', text: 'text-red-400', bar: 'from-red-500 to-rose-600' },
        moderate: { ring: 'ring-amber-500/30 bg-amber-500/5', text: 'text-amber-400', bar: 'from-amber-500 to-orange-500' },
        low: { ring: 'ring-emerald-500/30 bg-emerald-500/5', text: 'text-emerald-400', bar: 'from-emerald-500 to-teal-500' },
    };

    return (
        <div className="space-y-6">

            {/* Header card */}
            <div className="glass-card rounded-2xl p-6 border border-white/8">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                        <ScanEye size={24} className="text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">X-Ray Authenticity Checker</h2>
                        <p className="text-gray-400 text-sm mt-1">
                            Upload a chest or any X-ray image. We generate a perceptual fingerprint and compare it
                            against our database to detect possible image reuse or misuse.
                        </p>
                    </div>
                </div>
            </div>

            {/* Upload + controls */}
            {(state === 'idle' || state === 'error') && (
                <div className="space-y-4">
                    <UploadCard
                        accept={ACCEPTED_XRAY_TYPES.join(',')}
                        onFileSelect={handleFileSelect}
                        file={file}
                        uploading={false}
                        icon={<ImageIcon size={30} className="text-purple-400" />}
                        title="Drag & drop your X-ray image"
                        hint="Or click to browse your files"
                        acceptedLabel="JPG · PNG — Max 10MB"
                    />

                    {errorMsg && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fadeIn">
                            <AlertTriangle size={18} className="flex-shrink-0" />
                            {errorMsg}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            id="btn-check-xray"
                            onClick={() => handleCheck(false)}
                            disabled={!file}
                            className={`btn-primary flex-1 flex items-center justify-center gap-2 !py-3.5 transition-all
                                ${!file ? 'opacity-40 cursor-not-allowed' : 'hover-glow'}`}
                            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a21caf 100%)' }}
                        >
                            <ScanEye size={18} />
                            Check Authenticity
                        </button>
                        <button
                            id="btn-demo-xray"
                            onClick={() => handleCheck(true)}
                            className="btn-secondary flex-1 flex items-center justify-center gap-2 !py-3.5 hover:border-purple-500/40 hover:text-purple-400"
                        >
                            <Zap size={18} className="text-purple-400" />
                            Try Sample X-Ray
                        </button>
                    </div>
                </div>
            )}

            {/* Uploading */}
            {state === 'uploading' && (
                <div className="glass-card rounded-2xl p-8 border border-white/8 space-y-4 animate-fadeIn">
                    <p className="text-white font-bold text-center">Processing image…</p>
                    <ProgressBar progress={Math.round(progress)} label="Scanning image patterns…" />
                </div>
            )}

            {/* Processing */}
            {state === 'processing' && (
                <div className="glass-card rounded-2xl border border-white/8 animate-fadeIn">
                    <ProcessingState message="Scanning image patterns…" />
                </div>
            )}

            {/* Result */}
            {state === 'result' && result && (
                <div className="space-y-5 animate-fadeIn">
                    {/* Demo banner */}
                    {result.demoMode && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm">
                            <Info size={18} className="flex-shrink-0 text-purple-400" />
                            Showing demo results. Upload a real X-ray for actual fingerprint analysis.
                        </div>
                    )}

                    {/* Main result card */}
                    <div className={`glass-card rounded-2xl border p-6 ring-2 ${riskColors[result.riskLevel]?.ring || riskColors.low.ring}`}>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            {/* Similarity meter */}
                            <div className="flex-shrink-0">
                                <SimilarityMeter value={result.similarity} />
                            </div>

                            {/* Risk info */}
                            <div className="flex-1 text-center sm:text-left">
                                <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                                    <RiskBadge level={result.riskLevel} />
                                    <span className={`text-lg font-black ${riskColors[result.riskLevel]?.text || 'text-emerald-400'}`}>
                                        {result.riskLabel}
                                    </span>
                                </div>
                                <p className="text-gray-300 text-sm leading-relaxed">{result.message}</p>

                                {/* Similarity bar */}
                                <div className="mt-4">
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full bg-gradient-to-r ${riskColors[result.riskLevel]?.bar || 'from-emerald-500 to-teal-500'}`}
                                            style={{
                                                width: `${result.similarity}%`,
                                                transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
                                                boxShadow: '0 0 10px currentColor',
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1.5 font-mono">
                                        {result.hashesInDb} image{result.hashesInDb !== 1 ? 's' : ''} in comparison database
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Risk level guide */}
                    <div className="glass-card rounded-2xl p-5 border border-white/8">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Risk Level Guide</p>
                        <div className="grid grid-cols-3 gap-3 text-xs text-center">
                            <div className="p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20">
                                <p className="text-emerald-400 font-bold">&lt; 70%</p>
                                <p className="text-gray-400 mt-0.5">Likely Original</p>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-500/8 border border-amber-500/20">
                                <p className="text-amber-400 font-bold">70–90%</p>
                                <p className="text-gray-400 mt-0.5">Moderate Risk</p>
                            </div>
                            <div className="p-3 rounded-xl bg-red-500/8 border border-red-500/20">
                                <p className="text-red-400 font-bold">&gt; 90%</p>
                                <p className="text-gray-400 mt-0.5">High Risk</p>
                            </div>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/15 text-amber-300/80 text-xs leading-relaxed">
                        <ShieldAlert size={16} className="flex-shrink-0 mt-0.5 text-amber-400" />
                        <span>{result.disclaimer}</span>
                    </div>

                    {/* Reset */}
                    <button
                        id="btn-reset-xray"
                        onClick={handleReset}
                        className="btn-secondary w-full flex items-center justify-center gap-2 hover:border-purple-500/40"
                    >
                        <RotateCcw size={16} />
                        Check Another X-Ray
                    </button>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE: Diagnostics Hub
// ═══════════════════════════════════════════════════════════════════════════════

const TABS = [
    {
        id: 'report',
        label: 'Report Analyzer',
        icon: <FileText size={18} />,
        badge: 'AI',
        color: 'indigo',
    },
    {
        id: 'xray',
        label: 'X-Ray Authenticity',
        icon: <ScanEye size={18} />,
        badge: 'NEW',
        color: 'purple',
    },
];

export default function DiagnosticsHub() {
    const [activeTab, setActiveTab] = useState('report');

    return (
        <PageTransition>
            <div className="min-h-screen py-8 px-4">
                <div className="max-w-3xl mx-auto">

                    {/* ── Page Header ─────────────────────────────────────────────────── */}
                    <div className="mb-8 text-center relative">
                        {/* Background glow */}
                        <div className="absolute inset-x-0 top-0 h-32 pointer-events-none"
                            style={{
                                background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)',
                            }}
                        />

                        <div className="relative">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">
                                <FlaskConical size={14} />
                                AI Diagnostics Hub
                            </div>

                            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                                Smart{' '}
                                <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    Diagnostics
                                </span>
                            </h1>
                            <p className="text-gray-400 mt-3 text-base max-w-xl mx-auto leading-relaxed">
                                AI-powered medical report analysis and X-ray authenticity verification.
                                Get instant, plain-English insights from your health documents.
                            </p>
                        </div>
                    </div>

                    {/* ── Tab Switcher ─────────────────────────────────────────────────── */}
                    <div className="glass-card rounded-2xl p-1.5 border border-white/8 mb-8 flex gap-2">
                        {TABS.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const activeStyles = tab.color === 'purple'
                                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/20'
                                : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/20';

                            return (
                                <button
                                    key={tab.id}
                                    id={`tab-${tab.id}`}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300
                                        ${isActive
                                            ? activeStyles
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {tab.icon}
                                    <span className="hidden sm:inline">{tab.label}</span>
                                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black tracking-wider
                                        ${isActive
                                            ? 'bg-white/20 text-white'
                                            : tab.color === 'purple'
                                                ? 'bg-purple-500/15 text-purple-400'
                                                : 'bg-indigo-500/15 text-indigo-400'
                                        }`}>
                                        {tab.badge}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* ── Tab Content ──────────────────────────────────────────────────── */}
                    <div key={activeTab}>
                        {activeTab === 'report' && <ReportAnalyzer />}
                        {activeTab === 'xray' && <XrayChecker />}
                    </div>

                    {/* ── Info Footer ──────────────────────────────────────────────────── */}
                    <div className="mt-10 p-5 rounded-2xl bg-white/2 border border-white/5 flex items-start gap-4">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <Info size={18} className="text-blue-400" />
                        </div>
                        <div className="text-xs text-gray-500 leading-relaxed space-y-1">
                            <p className="text-gray-400 font-semibold text-sm">About AI Diagnostics Hub</p>
                            <p>
                                The <strong className="text-gray-300">Report Analyzer</strong> uses AI vision to extract and interpret medical parameters from uploaded lab reports.
                                The <strong className="text-gray-300">X-Ray Authenticity Checker</strong> uses perceptual fingerprinting to detect possible image reuse.
                            </p>
                            <p className="text-amber-500/70 font-semibold">
                                ⚠ Neither module provides medical diagnoses. All results are for informational purposes only.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </PageTransition>
    );
}
