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
            const { data } = await axios.get('http://localhost:5001/api/medications');
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
            await axios.post('http://localhost:5001/api/medications', formData);
            setFormData({ name: '', dosage: '', frequency: 'Once daily', timeOfDay: [], notes: '' });
            fetchMedications();
        } catch (error) {
            alert('Error adding medication');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this medication?')) return;
        try {
            await axios.delete(`http://localhost:5001/api/medications/${id}`);
            setMedications(medications.filter(med => med._id !== id));
        } catch (error) {
            alert('Error deleting medication');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">My Medications</h1>
            </div>

            {/* Input Form */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <Plus size={20} className="mr-2 text-primary" /> Add New Medication
                </h2>
                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="e.g. Aspirin"
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
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
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            value={formData.dosage}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                        <select
                            name="frequency"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time of Day</label>
                        <div className="flex flex-wrap gap-2">
                            {['Morning', 'Afternoon', 'Evening', 'Night'].map(time => (
                                <button
                                    key={time}
                                    type="button"
                                    onClick={() => handleTimeToggle(time)}
                                    className={`px-3 py-1 text-sm rounded-full border transition-all ${formData.timeOfDay.includes(time)
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
                                        }`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="md:col-span-2 mt-2 bg-primary hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-all">
                        Save Medication
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <p className="text-center text-gray-500">Loading medications...</p>
                ) : medications.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <p className="text-gray-500">No medications added yet.</p>
                    </div>
                ) : (
                    medications.map(med => (
                        <div key={med._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center card-hover">
                            <div className="flex items-start">
                                <div className="bg-blue-50 p-3 rounded-xl mr-4 text-primary">
                                    <Pill size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{med.name}</h3>
                                    <p className="text-gray-500 text-sm">{med.dosage} • {med.frequency}</p>
                                    {med.timeOfDay.length > 0 && (
                                        <div className="flex items-center mt-2 text-xs text-gray-400">
                                            <Clock size={12} className="mr-1" /> {med.timeOfDay.join(', ')}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(med._id)}
                                className="text-gray-400 hover:text-red-500 transition-colors p-2"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MedicationList;
