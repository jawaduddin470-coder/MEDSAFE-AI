import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Pill, Clock } from 'lucide-react';

const MedicationList = () => {
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        frequency: 'Once daily',
        timeOfDay: [],
        notes: ''
    });

    const fetchMedications = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/medications`);
            setMedications(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedications();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTimeToggle = (time) => {
        const times = formData.timeOfDay.includes(time)
            ? formData.timeOfDay.filter(t => t !== time)
            : [...formData.timeOfDay, time];
        setFormData({ ...formData, timeOfDay: times });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/medications`, formData);
            setFormData({ name: '', dosage: '', frequency: 'Once daily', timeOfDay: [], notes: '' });
            fetchMedications();
        } catch (error) {
            alert('Error adding medication');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this medication?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/medications/${id}`);
            setMedications(medications.filter(med => med._id !== id));
        } catch (error) {
            alert('Error deleting medication');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3 uppercase italic">
                    <Pill className="text-indigo-500" size={32} /> MY MEDICATIONS
                </h1>
            </div>

            {/* Input Form */}
            <div className="glass-card p-10 rounded-[2rem] border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary opacity-50" />
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                    <Plus size={24} className="text-indigo-500" /> ADD NEW ENTRY
                </h2>
                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="e.g. Aspirin"
                            required
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium"
                            value={formData.name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                        <select
                            name="frequency"
                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white outline-none focus:border-indigo-500/50 transition-all font-medium appearance-none"
                            value={formData.frequency}
                            onChange={handleInputChange}
                        >
                            <option>Once daily</option>
                            <option>Twice daily</option>
                            <option>3 times daily</option>
                            <option>As needed</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Time of Day</label>
                        <div className="flex flex-wrap gap-3">
                            {['Morning', 'Afternoon', 'Evening', 'Night'].map(time => (
                                <button
                                    key={time}
                                    type="button"
                                    onClick={() => handleTimeToggle(time)}
                                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 border ${formData.timeOfDay.includes(time)
                                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
                                        : 'bg-indigo-50/50 dark:bg-white/5 text-indigo-600 dark:text-gray-400 border-indigo-100 dark:border-white/10 hover:border-indigo-500/30'
                                        }`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="md:col-span-2 mt-6 btn-primary w-full !py-4 text-sm tracking-widest uppercase">
                        Save to Inventory
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center p-20">
                        <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                    </div>
                ) : medications.length === 0 ? (
                    <div className="text-center py-20 glass-card rounded-[2rem] border-white/5 border-dashed">
                        <p className="text-gray-500 font-medium italic mb-2 text-lg">Your inventory is currently empty.</p>
                        <p className="text-xs text-gray-600 uppercase tracking-widest">Start by adding a prescription above</p>
                    </div>
                ) : (
                    medications.map(med => (
                        <div key={med._id} className="glass-card p-6 rounded-[2rem] border-white/5 flex justify-between items-center transition-all duration-500 hover:bg-white/[0.07] hover:-translate-y-1 group/med shadow-lg hover:shadow-2xl">
                            <div className="flex items-center">
                                <div className="bg-indigo-500/10 p-5 rounded-2xl mr-6 text-indigo-500 group-hover/med:scale-110 group-hover/med:rotate-3 transition-transform duration-500 border border-indigo-500/10">
                                    <Pill size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight group-hover/med:text-indigo-500 transition-colors uppercase italic">{med.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">{med.dosage} • {med.frequency}</p>
                                    {med.timeOfDay.length > 0 && (
                                        <div className="flex items-center mt-3 text-[10px] text-teal-500/60 font-black uppercase tracking-[0.2em]">
                                            <Clock size={14} className="mr-2" /> {med.timeOfDay.join(' • ')}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(med._id)}
                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/20 transition-all duration-300 opacity-0 group-hover/med:opacity-100 border border-transparent hover:border-red-500/20"
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
