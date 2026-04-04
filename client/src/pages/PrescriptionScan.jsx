import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ScanLine, Upload, Camera, FileImage, Trash2, Plus, AlertTriangle,
    CheckCircle, Bell, ChevronRight, ShieldAlert, X, Loader2,
    History, RefreshCw, Save, ShieldCheck, Zap, Edit3, ClipboardList
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useReminders } from '../context/ReminderContext';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api`;

// ─── Helper: today's date string ────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split('T')[0];

// ─── Prescription History via localStorage ───────────────────────────────────
const HISTORY_KEY = 'medsafe_rx_history';
const loadHistory = () => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
};
const saveHistory = (history) => localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

// ─── Seed medicines for time pickers ────────────────────────────────────────
const defaultTime = () => '08:00';

// ─── Main Component ──────────────────────────────────────────────────────────
const PrescriptionScan = () => {
    const { t } = useLanguage();
    const { addReminder } = useReminders();
    const navigate = useNavigate();

    // -- Upload / Image state
    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    // -- Scan / Processing state
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);

    // -- Results state
    const [medicines, setMedicines] = useState([]); // [{name, dosage, frequency, notes, time}]
    const [scanDone, setScanDone] = useState(false);
    const [ocrError, setOcrError] = useState('');
    const [showManual, setShowManual] = useState(false);

    // -- Risk check
    const [riskData, setRiskData] = useState(null);
    const [loadingRisk, setLoadingRisk] = useState(false);

    // -- Reminder scheduling
    const [showScheduler, setShowScheduler] = useState(false);
    const [remindersSaved, setRemindersSaved] = useState(false);
    const [savingReminders, setSavingReminders] = useState(false);

    // -- History
    const [history, setHistory] = useState(loadHistory);
    const [expandedHistory, setExpandedHistory] = useState(null);

    // ── Drag-and-drop handlers ────────────────────────────────────────────
    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) processImageFile(file);
    };

    const processImageFile = (file) => {
        setImageFile(file);
        setScanDone(false);
        setMedicines([]);
        setRiskData(null);
        setOcrError('');
        setRemindersSaved(false);
        setShowScheduler(false);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreviewUrl(e.target.result);
        reader.readAsDataURL(file);
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        if (file) processImageFile(file);
    };

    // ── Scan animation ────────────────────────────────────────────────────
    useEffect(() => {
        if (!isScanning) { setScanProgress(0); return; }
        const interval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 95) return 95; // plateau until real OCR finishes
                return prev + Math.random() * 8;
            });
        }, 200);
        return () => clearInterval(interval);
    }, [isScanning]);

    // ── Run OCR ───────────────────────────────────────────────────────────
    const analyzePrescription = async () => {
        if (!imageFile) return;
        setIsScanning(true);
        setOcrError('');
        setScanDone(false);
        setMedicines([]);
        setRiskData(null);
        setShowScheduler(false);
        setRemindersSaved(false);

        try {
            const base64 = await fileToBase64(imageFile);
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${API_URL}/ocr/prescription`,
                { image: base64 },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const detected = (data.medications || []).map(m => ({
                name: m.name || '',
                dosage: m.dosage || '',
                frequency: m.frequency || '',
                notes: m.notes || '',
                time: defaultTime(),
            }));

            setScanProgress(100);
            await new Promise(r => setTimeout(r, 600));

            if (detected.length === 0) {
                setOcrError(t('rx_error_ocr'));
                setShowManual(true);
            } else {
                setMedicines(detected);
                // Auto-run risk check
                runRiskCheck();
            }
        } catch (err) {
            console.error('OCR error:', err);
            setOcrError(t('rx_error_ocr'));
            setShowManual(true);
        } finally {
            setIsScanning(false);
            setScanDone(true);
        }
    };

    // ── Risk Check ────────────────────────────────────────────────────────
    const runRiskCheck = useCallback(async () => {
        setLoadingRisk(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${API_URL}/safety/audit`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRiskData(data);
        } catch (err) {
            console.warn('Risk check failed:', err.message);
        } finally {
            setLoadingRisk(false);
        }
    }, []);

    // ── Medicine list helpers ─────────────────────────────────────────────
    const updateMedicine = (idx, field, value) => {
        setMedicines(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
    };
    const removeMedicine = (idx) => setMedicines(prev => prev.filter((_, i) => i !== idx));
    const addManualRow = () => setMedicines(prev => [
        ...prev, { name: '', dosage: '', frequency: '', notes: '', time: defaultTime() }
    ]);

    // ── Save reminders ─────────────────────────────────────────────────────
    const saveReminders = async () => {
        setSavingReminders(true);
        const today = todayStr();
        const promises = medicines.filter(m => m.name.trim()).map(m =>
            addReminder({
                medicineName: m.name.trim(),
                dosage: m.dosage || '',
                time: m.time || '08:00',
                date: today,
                repeat: 'daily',
                notes: [m.frequency, m.notes].filter(Boolean).join(' – '),
                status: 'upcoming',
            })
        );
        await Promise.allSettled(promises);

        // Save to prescription history
        const entry = {
            id: Date.now(),
            date: new Date().toISOString(),
            imageUrl: imagePreviewUrl,
            medicines: medicines.filter(m => m.name.trim()),
        };
        const newHistory = [entry, ...history].slice(0, 20);
        setHistory(newHistory);
        saveHistory(newHistory);

        setSavingReminders(false);
        setRemindersSaved(true);
    };

    // ── Utilities ─────────────────────────────────────────────────────────
    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const reset = () => {
        setImageFile(null);
        setImagePreviewUrl('');
        setScanDone(false);
        setMedicines([]);
        setRiskData(null);
        setOcrError('');
        setShowManual(false);
        setShowScheduler(false);
        setRemindersSaved(false);
        setScanProgress(0);
    };

    // ─────────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-24">
            {/* ── Hero Header ─────────────────────────────────────────── */}
            <div className="relative py-14 px-10 rounded-[3.5rem] overflow-hidden text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-600/10 via-indigo-600/10 to-blue-400/10 backdrop-blur-3xl -z-10" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/10 blur-[100px] -z-10 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/10 blur-[80px] -z-10" />

                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-black uppercase tracking-[0.4em] mb-6">
                    <ScanLine size={14} className="animate-pulse" /> AI Prescription Scanner
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic leading-[0.9] mb-4">
                    {t('rx_title').split(' ')[0]}{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500">
                        {t('rx_title').split(' ').slice(1).join(' ')}
                    </span>
                </h1>
                <p className="text-gray-400 font-medium max-w-xl mx-auto text-base">
                    Upload a prescription image — our AI extracts medicines, checks for risks, and sets reminders automatically.
                </p>
            </div>

            {/* ── Upload + Preview Area ────────────────────────────────── */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Upload Zone */}
                <div
                    onClick={() => fileInputRef.current.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative cursor-pointer rounded-[2.5rem] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center min-h-[320px] p-8 gap-5
                        ${isDragging
                            ? 'border-teal-400 bg-teal-500/10 scale-[1.01]'
                            : 'border-white/10 bg-white/5 dark:bg-white/[0.03] hover:border-teal-500/40 hover:bg-teal-500/5'
                        }`}
                >
                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all
                        ${isDragging ? 'bg-teal-500/30' : 'bg-teal-500/10'}`}>
                        <Upload size={36} className="text-teal-400" />
                    </div>
                    <div className="text-center">
                        <p className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-sm">
                            {t('rx_upload_hint')}
                        </p>
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                            JPG · PNG · WEBP · PDF
                        </p>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />

                    {/* Camera button */}
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); cameraInputRef.current.click(); }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black text-xs uppercase tracking-widest hover:bg-indigo-500/20 transition-all"
                    >
                        <Camera size={16} />
                        {t('rx_camera')}
                    </button>
                    <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileInput} />
                </div>

                {/* Preview / Scan Animation */}
                <div className="relative rounded-[2.5rem] overflow-hidden min-h-[320px] bg-black/30 border border-white/5 flex items-center justify-center">
                    {imagePreviewUrl ? (
                        <>
                            <img
                                src={imagePreviewUrl}
                                alt="Prescription preview"
                                className="w-full h-full object-contain max-h-[480px]"
                            />

                            {/* Scanning overlay */}
                            {isScanning && (
                                <div className="absolute inset-0 z-10">
                                    {/* Dark tint */}
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
                                    {/* Moving scan line */}
                                    <div
                                        className="absolute inset-x-0 h-1 bg-teal-400 shadow-[0_0_20px_4px_#2dd4bf] z-20 transition-all duration-200"
                                        style={{ top: `${scanProgress}%` }}
                                    />
                                    {/* Scan progress bar corners */}
                                    <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-teal-400" />
                                    <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-teal-400" />
                                    <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-teal-400" />
                                    <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-teal-400" />
                                    {/* Status text */}
                                    <div className="absolute inset-x-0 bottom-8 flex justify-center">
                                        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-black/70 backdrop-blur-md border border-teal-500/30">
                                            <Loader2 size={18} className="animate-spin text-teal-400" />
                                            <p className="text-teal-300 font-black text-xs uppercase tracking-widest">
                                                {t('rx_analyzing')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reset button */}
                            {!isScanning && (
                                <button
                                    onClick={reset}
                                    className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 text-white hover:bg-red-500/80 transition-all z-10"
                                    title="Remove image"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-4 opacity-30">
                            <FileImage size={64} className="text-white" />
                            <p className="text-xs font-bold text-white uppercase tracking-widest">Preview</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Analyze Button ───────────────────────────────────────── */}
            {imagePreviewUrl && !isScanning && (
                <div className="flex justify-center gap-4">
                    <button
                        onClick={analyzePrescription}
                        disabled={isScanning}
                        className="group flex items-center gap-4 bg-gradient-to-r from-teal-500 to-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-teal-500/30 hover:scale-105 hover:shadow-teal-500/50 active:scale-95 transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none"
                    >
                        <ScanLine size={22} className="group-hover:animate-pulse" />
                        {t('rx_analyze')}
                    </button>
                </div>
            )}

            {/* ── OCR Error ────────────────────────────────────────────── */}
            {ocrError && (
                <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-4">
                    <AlertTriangle size={20} className="text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-black text-amber-400 text-sm uppercase tracking-wide">{ocrError}</p>
                        <button
                            onClick={() => setShowManual(true)}
                            className="mt-3 text-xs font-black text-indigo-400 uppercase tracking-widest underline underline-offset-4 hover:text-indigo-300"
                        >
                            {t('rx_edit_manual')} →
                        </button>
                    </div>
                </div>
            )}

            {/* ── Detected Medicines Panel ─────────────────────────────── */}
            {(medicines.length > 0 || showManual) && scanDone && (
                <div className="glass-card rounded-[2.5rem] p-8 border-white/5 shadow-3xl space-y-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase italic tracking-tight">
                            <ClipboardList size={24} className="text-teal-400" />
                            {t('rx_detected')}
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-black uppercase tracking-widest">
                                {medicines.filter(m => m.name).length} Found
                            </span>
                            <button
                                onClick={addManualRow}
                                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black text-xs uppercase tracking-widest hover:bg-indigo-500/20 transition-all"
                            >
                                <Plus size={14} /> {t('rx_add_row')}
                            </button>
                        </div>
                    </div>

                    {/* Medicines Table */}
                    <div className="space-y-3">
                        {medicines.map((med, idx) => (
                            <MedicineRow
                                key={idx}
                                med={med}
                                idx={idx}
                                t={t}
                                showTime={showScheduler}
                                onChange={updateMedicine}
                                onRemove={removeMedicine}
                            />
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
                        {!showScheduler ? (
                            <button
                                onClick={() => setShowScheduler(true)}
                                className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:scale-105 transition-all"
                            >
                                <Bell size={18} />
                                {t('rx_generate_schedule')}
                            </button>
                        ) : (
                            <button
                                onClick={saveReminders}
                                disabled={savingReminders || remindersSaved}
                                className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-60 disabled:pointer-events-none"
                            >
                                {savingReminders
                                    ? <Loader2 size={18} className="animate-spin" />
                                    : remindersSaved
                                        ? <CheckCircle size={18} />
                                        : <Save size={18} />
                                }
                                {remindersSaved ? t('rx_reminders_saved') : t('rx_save_reminders')}
                            </button>
                        )}

                        {remindersSaved && (
                            <button
                                onClick={() => navigate('/reminders')}
                                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black text-sm uppercase tracking-widest hover:bg-blue-500/20 transition-all"
                            >
                                <Bell size={18} /> View Reminders
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ── Risk Check Results ───────────────────────────────────── */}
            {(riskData || loadingRisk) && scanDone && (
                <RiskPanel data={riskData} loading={loadingRisk} t={t} onRerun={runRiskCheck} />
            )}

            {/* ── Prescription History ─────────────────────────────────── */}
            <div className="space-y-6">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase italic tracking-tight">
                    <History size={24} className="text-indigo-400" />
                    {t('rx_history_title')}
                </h2>

                {history.length === 0 ? (
                    <div className="glass-card rounded-[2rem] p-12 text-center border border-white/5">
                        <History size={48} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">{t('rx_history_empty')}</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {history.map(entry => (
                            <HistoryCard
                                key={entry.id}
                                entry={entry}
                                t={t}
                                expanded={expandedHistory === entry.id}
                                onToggle={() => setExpandedHistory(prev => prev === entry.id ? null : entry.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Medicine Row Component ───────────────────────────────────────────────────
const MedicineRow = ({ med, idx, t, showTime, onChange, onRemove }) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-5 rounded-2xl bg-white/5 border border-white/[0.07] hover:bg-white/[0.08] transition-colors group">
        {/* Medicine Name */}
        <div>
            <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{t('rx_name')}</label>
            <input
                value={med.name}
                onChange={e => onChange(idx, 'name', e.target.value)}
                placeholder="e.g. Amoxicillin"
                className="w-full bg-transparent border-b border-white/10 focus:border-teal-400 text-gray-900 dark:text-white font-bold text-sm py-1 outline-none transition-colors placeholder-gray-600"
            />
        </div>
        {/* Dosage */}
        <div>
            <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{t('rx_dosage')}</label>
            <input
                value={med.dosage}
                onChange={e => onChange(idx, 'dosage', e.target.value)}
                placeholder="e.g. 500mg"
                className="w-full bg-transparent border-b border-white/10 focus:border-teal-400 text-gray-900 dark:text-white font-bold text-sm py-1 outline-none transition-colors placeholder-gray-600"
            />
        </div>
        {/* Frequency */}
        <div>
            <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{t('rx_frequency')}</label>
            <input
                value={med.frequency}
                onChange={e => onChange(idx, 'frequency', e.target.value)}
                placeholder="e.g. Twice daily"
                className="w-full bg-transparent border-b border-white/10 focus:border-teal-400 text-gray-900 dark:text-white font-bold text-sm py-1 outline-none transition-colors placeholder-gray-600"
            />
        </div>
        {/* Time picker (only shown when scheduler is open) / Delete */}
        <div className="flex items-end gap-3">
            {showTime && (
                <div className="flex-1">
                    <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{t('rx_time')}</label>
                    <input
                        type="time"
                        value={med.time || '08:00'}
                        onChange={e => onChange(idx, 'time', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-gray-900 dark:text-white font-bold text-sm outline-none focus:border-teal-400 transition-colors"
                    />
                </div>
            )}
            <button
                onClick={() => onRemove(idx)}
                className="p-2 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all ml-auto opacity-0 group-hover:opacity-100"
                title="Remove"
            >
                <Trash2 size={16} />
            </button>
        </div>
    </div>
);

// ─── Risk Panel Component ─────────────────────────────────────────────────────
const RiskPanel = ({ data, loading, t, onRerun }) => (
    <div className="glass-card rounded-[2.5rem] p-8 border-white/5 shadow-3xl bg-gradient-to-b from-transparent to-amber-500/5 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3 uppercase italic tracking-tight">
                <ShieldAlert size={24} className="text-amber-400" />
                {t('rx_risk_title')}
            </h2>
            <button
                onClick={onRerun}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black text-xs uppercase tracking-widest hover:bg-amber-500/20 transition-all disabled:opacity-40"
            >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Recheck
            </button>
        </div>

        {loading ? (
            <div className="flex flex-col items-center py-12 gap-4">
                <Loader2 size={32} className="text-amber-400 animate-spin" />
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Running Safety Scan…</p>
            </div>
        ) : data ? (
            <div className="space-y-4">
                {/* Score */}
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Safety Score</p>
                        <span className={`text-5xl font-black italic tracking-tighter ${data.safetyScore > 80 ? 'text-emerald-400' : data.safetyScore > 50 ? 'text-amber-400' : 'text-red-400'}`}>
                            {data.safetyScore}
                        </span>
                        <span className="text-gray-500 font-black"> / 100</span>
                    </div>
                    <div className={`flex-1 px-5 py-3 rounded-2xl border ${data.riskLevel === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-400' : data.riskLevel === 'Moderate' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                        <p className="font-black text-sm uppercase tracking-widest">{data.riskLevel} Risk</p>
                        <p className="text-[10px] font-bold opacity-70 mt-0.5">{data.alerts?.length || 0} alert(s) found</p>
                    </div>
                </div>

                {/* Alerts */}
                {data.alerts?.length > 0 ? (
                    <div className="space-y-3">
                        {data.alerts.map((alert, i) => (
                            <div key={i} className={`p-4 rounded-2xl border ${alert.severity === 'High' ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle size={14} className={alert.severity === 'High' ? 'text-red-400' : 'text-amber-400'} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${alert.severity === 'High' ? 'text-red-400' : 'text-amber-400'}`}>
                                        {alert.severity} · {alert.type}
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{alert.message}</p>
                                {alert.detail && <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{alert.detail}</p>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center py-8 gap-3 text-emerald-400">
                        <ShieldCheck size={40} />
                        <p className="font-black text-sm uppercase tracking-widest">No Interaction Alerts</p>
                    </div>
                )}
            </div>
        ) : null}
    </div>
);

// ─── History Card Component ───────────────────────────────────────────────────
const HistoryCard = ({ entry, t, expanded, onToggle }) => {
    const dateStr = new Date(entry.date).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="glass-card rounded-[2rem] overflow-hidden border border-white/5 hover:border-white/10 transition-all group">
            {/* Thumbnail */}
            {entry.imageUrl && (
                <div className="h-36 overflow-hidden bg-black/30">
                    <img src={entry.imageUrl} alt="Prescription" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
            )}
            <div className="p-5">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                    {t('rx_history_date')}: {dateStr}
                </p>
                <p className="font-black text-gray-900 dark:text-white text-sm">
                    {entry.medicines.length} {t('rx_history_medicines')}
                </p>

                <button
                    onClick={onToggle}
                    className="mt-3 flex items-center gap-2 text-indigo-400 font-black text-[11px] uppercase tracking-widest hover:text-indigo-300 transition-colors"
                >
                    <ChevronRight size={14} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
                    {expanded ? 'Hide' : 'View'} Medicines
                </button>

                {expanded && (
                    <ul className="mt-3 space-y-1.5 border-t border-white/5 pt-3">
                        {entry.medicines.map((m, i) => (
                            <li key={i} className="text-xs font-bold text-gray-400">
                                <span className="text-white">{m.name}</span>
                                {m.dosage && <span className="text-gray-500"> — {m.dosage}</span>}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default PrescriptionScan;
