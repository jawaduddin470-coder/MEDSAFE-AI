import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Pill, Clock, AlertTriangle, Camera, Users, Loader2, ScanLine } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import InteractionWarning from '../components/InteractionWarning';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const MedicationList = () => {
    const { t } = useLanguage();
    const [medications, setMedications] = useState([]);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState('me'); // 'me' or member ID
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [interactionWarnings, setInteractionWarnings] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        frequency: 'Once daily',
        timeOfDay: [],
        notes: '',
        profileId: null
    });

    const fetchFamily = async () => {
        try {
            const { data } = await axios.get(`${API_BASE}/api/family`);
            setFamilyMembers(data);
        } catch (err) { console.error(err); }
    };

    const fetchMedications = async () => {
        try {
            setLoading(true);
            const url = selectedProfile === 'me'
                ? `${API_BASE}/api/medications`
                : `${API_BASE}/api/medications?profileId=${selectedProfile}`;
            const { data } = await axios.get(url);
            setMedications(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFamily();
    }, []);

    useEffect(() => {
        fetchMedications();
        setFormData(prev => ({ ...prev, profileId: selectedProfile === 'me' ? null : selectedProfile }));
    }, [selectedProfile]);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleTimeToggle = (time) => {
        const times = formData.timeOfDay.includes(time)
            ? formData.timeOfDay.filter(t => t !== time)
            : [...formData.timeOfDay, time];
        setFormData({ ...formData, timeOfDay: times });
    };

    const handleScan = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setScanning(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result;
            try {
                const { data } = await axios.post(`${API_BASE}/api/ocr/scan`, { image: base64 });
                setFormData(prev => ({
                    ...prev,
                    name: data.name || prev.name,
                    dosage: data.dosage || prev.dosage,
                    frequency: data.frequency || prev.frequency,
                    notes: data.notes || prev.notes
                }));
            } catch (err) {
                console.error("OCR Error", err);
                alert("Failed to scan medicine. Please try manual entry.");
            } finally {
                setScanning(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setInteractionWarnings([]);

        // Safety check logic (basic)
        const existingNames = medications.map(m => m.name);
        if (existingNames.length >= 1 && localStorage.getItem('token')) {
            try {
                const { data } = await axios.post(`${API_BASE}/api/interactions/check`, {
                    medications: [...existingNames, formData.name]
                });
                if (data.warnings?.length > 0) setInteractionWarnings(data.warnings);
            } catch (_) { }
        }

        try {
            await axios.post(`${API_BASE}/api/medications`, formData);
            setFormData({ name: '', dosage: '', frequency: 'Once daily', timeOfDay: [], notes: '', profileId: selectedProfile === 'me' ? null : selectedProfile });
            fetchMedications();
        } catch (error) {
            console.error('Error adding medication:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(t('btn_confirm') + ': Delete this medication?')) return;
        try {
            await axios.delete(`${API_BASE}/api/medications/${id}`);
            setMedications(medications.filter(med => med._id !== id));
        } catch (error) {
            console.error('Error deleting medication:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3 uppercase italic">
                    <Pill className="text-indigo-500" size={32} />
                    {t('meds_title')}
                </h1>

                {/* Profile Selector */}
                <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                    <button
                        onClick={() => setSelectedProfile('me')}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedProfile === 'me' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-indigo-400'}`}
                    >
                        {t('nav_dashboard')}
                    </button>
                    {familyMembers.map(member => (
                        <button
                            key={member._id}
                            onClick={() => setSelectedProfile(member._id)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${selectedProfile === member._id ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-purple-400'}`}
                        >
                            {member.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Interaction Warnings */}
            {interactionWarnings.length > 0 && (
                <InteractionWarning
                    warnings={interactionWarnings}
                    onDismiss={(i) => setInteractionWarnings(prev => prev.filter((_, idx) => idx !== i))}
                />
            )}

            {/* Add Medication Form */}
            <div className="glass-card p-10 rounded-[2rem] border-white/5 relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${selectedProfile === 'me' ? 'from-indigo-500 to-teal-400' : 'from-purple-500 to-pink-400'} opacity-50`} />
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3 lowercase italic">
                        <Plus size={24} className="text-indigo-500" /> {t('meds_add')} for <span className="text-indigo-500 not-italic uppercase font-black tracking-widest">{selectedProfile === 'me' ? 'Self' : familyMembers.find(m => m._id === selectedProfile)?.name}</span>
                    </h2>

                    {/* OCR Scan Button */}
                    <label className="flex items-center gap-2 bg-indigo-500/10 text-indigo-500 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-indigo-500/20 transition-all">
                        {scanning ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                        {scanning ? 'Analyzing...' : 'Scan Medicine'}
                        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleScan} disabled={scanning} />
                    </label>
                </div>

                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 relative">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t('meds_name')}</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="e.g. Aspirin"
                            required
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                        <ScanLine className="absolute right-4 bottom-4 text-indigo-500/20 pointer-events-none" size={20} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t('meds_dosage')}</label>
                        <input
                            type="text"
                            name="dosage"
                            placeholder="e.g. 100mg"
                            required
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
                            value={formData.dosage}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t('meds_frequency')}</label>
                        <select
                            name="frequency"
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white outline-none focus:border-indigo-500/50 transition-all font-medium"
                            value={formData.frequency}
                            onChange={handleInputChange}
                        >
                            <option value="Once daily">Once daily</option>
                            <option value="Twice daily">Twice daily</option>
                            <option value="3 times daily">3 times daily</option>
                            <option value="As needed">As needed</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">{t('meds_time_of_day')}</label>
                        <div className="flex flex-wrap gap-3">
                            {[
                                { key: 'Morning', label: t('meds_time_morning') },
                                { key: 'Afternoon', label: t('meds_time_afternoon') },
                                { key: 'Evening', label: t('meds_time_evening') },
                                { key: 'Night', label: t('meds_time_night') }
                            ].map(time => (
                                <button
                                    key={time.key}
                                    type="button"
                                    onClick={() => handleTimeToggle(time.key)}
                                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 border ${formData.timeOfDay.includes(time.key)
                                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                                        : 'bg-indigo-50/50 dark:bg-white/5 text-indigo-600 dark:text-gray-400 border-indigo-100 dark:border-white/10 hover:border-indigo-500/30'
                                        }`}
                                >
                                    {time.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t('meds_notes')}</label>
                        <input
                            type="text"
                            name="notes"
                            placeholder="e.g. Take with food"
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
                            value={formData.notes}
                            onChange={handleInputChange}
                        />
                    </div>

                    <button type="submit" disabled={saving} className={`md:col-span-2 mt-6 btn-primary hover-glow w-full !py-4 text-sm tracking-widest uppercase disabled:opacity-50 ${selectedProfile !== 'me' ? 'bg-purple-600 shadow-purple-500/30' : ''}`}>
                        {saving ? 'Saving…' : t('meds_add').toUpperCase()}
                    </button>
                </form>
            </div>

            {/* Medications List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        {t('nav_myMeds')} • {selectedProfile === 'me' ? 'Self' : familyMembers.find(m => m._id === selectedProfile)?.name}
                    </p>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-lg">
                        {medications.length} {t('dashboard_total_meds')}
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center p-20">
                        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                ) : medications.length === 0 ? (
                    <div className="text-center py-20 glass-card rounded-[2rem] border-white/5 border-dashed">
                        <Pill size={48} className="text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium italic mb-2 text-lg">{t('meds_empty')}</p>
                    </div>
                ) : (
                    medications.map(med => (
                        <div key={med._id} className="glass-card p-6 rounded-[2rem] border-white/5 flex justify-between items-center transition-all duration-500 hover:bg-white/[0.07] hover:-translate-y-1 group/med shadow-lg hover:shadow-2xl">
                            <div className="flex items-center">
                                <div className={`p-5 rounded-2xl mr-6 group-hover/med:scale-110 group-hover/med:rotate-3 transition-transform duration-500 border ${selectedProfile === 'me' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/10' : 'bg-purple-500/10 text-purple-500 border-purple-500/10'}`}>
                                    <Pill size={32} />
                                </div>
                                <div>
                                    <h3 className={`text-2xl font-black text-gray-900 dark:text-white tracking-tight transition-colors uppercase italic ${selectedProfile === 'me' ? 'group-hover/med:text-indigo-500' : 'group-hover/med:text-purple-500'}`}>{med.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">{med.dosage} • {med.frequency}</p>
                                    {med.notes && <p className="text-xs text-gray-400 mt-1 italic opacity-80">{med.notes}</p>}
                                    {med.timeOfDay?.length > 0 && (
                                        <div className="flex items-center mt-3 text-[10px] text-teal-500 font-black uppercase tracking-[0.2em] bg-teal-500/5 py-1 px-3 rounded-xl w-fit">
                                            <Clock size={14} className="mr-2" /> {med.timeOfDay.join(' • ')}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(med._id)}
                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all duration-300 opacity-0 group-hover/med:opacity-100 border border-transparent hover:border-red-500/20"
                            >
                                <Trash2 size={24} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MedicationList;
