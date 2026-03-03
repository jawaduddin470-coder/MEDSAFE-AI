import React, { useState, useEffect } from 'react';
import { Plus, Trash2, User, Heart, Users, UserPlus } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const FamilyProfiles = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', relation: '', age: '' });
    const { user } = useAuth();
    const token = localStorage.getItem('token');

    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/family`, config);
            setMembers(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this profile?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/family/${id}`, config);
                setMembers(members.filter((member) => member._id !== id));
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/family`, formData, config);
            setMembers([...members, res.data]);
            setShowModal(false);
            setFormData({ name: '', relation: '', age: '' });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-3 uppercase italic">
                    <Users className="text-indigo-500" size={32} /> FAMILY HUB
                </h1>
            </div>

            {/* Add Profile Section */}
            <div className="glass-card p-10 rounded-[2rem] border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                    <UserPlus size={24} className="text-indigo-500" /> NEW MEMBER
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                    Add a new family member to manage their medication safety and health profiles.
                </p>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
                >
                    <Plus size={20} className="mr-2" />
                    Add Member
                </button>
            </div>

            {/* Profiles List */}
            <div className="grid md:grid-cols-2 gap-6">
                {loading ? (
                    <div className="md:col-span-2 flex justify-center p-20">
                        <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                    </div>
                ) : members.length === 0 ? (
                    <div className="md:col-span-2 text-center py-20 glass-card rounded-[2rem] border-white/5 border-dashed">
                        <p className="text-gray-500 font-medium italic text-lg mb-2">No profiles registered.</p>
                        <p className="text-xs text-gray-600 uppercase tracking-widest">Connect with your loved ones above</p>
                    </div>
                ) : (
                    members.map(member => (
                        <div key={member._id} className="glass-card p-8 rounded-[2rem] border-white/5 relative overflow-hidden group transition-all duration-500 hover:bg-white/[0.07] hover:-translate-y-2 shadow-lg hover:shadow-2xl">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-500 to-transparent opacity-30" />
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform duration-500">
                                    <User size={32} />
                                </div>
                                <button
                                    onClick={() => handleDelete(member._id)}
                                    className="p-3 rounded-xl bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-500/20"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-2 group-hover:text-indigo-500 transition-colors uppercase">{member.name}</h3>
                            <p className="text-gray-600 dark:text-gray-500 font-bold text-xs uppercase tracking-widest mb-4">AGE: {member.age} • STATUS: ACTIVE</p>

                            {member.medications && member.medications.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                                    {member.medications.map((medication, idx) => (
                                        <span key={idx} className="bg-white/5 text-[10px] font-black text-teal-500/80 px-3 py-1 rounded-lg border border-white/10 uppercase tracking-tighter">
                                            {medication.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="glass-card rounded-[2.5rem] w-full max-w-md p-10 border-white/10 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary" />
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-6 tracking-tight uppercase">Add Member</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-gray-900 dark:text-white outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                                    placeholder="Enter full name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Relationship</label>
                                    <select
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-teal-500/50 transition-all appearance-none"
                                        value={formData.relation}
                                        onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                                    >
                                        <option value="" className="bg-gray-900">Select...</option>
                                        <option value="parent" className="bg-gray-900">Parent</option>
                                        <option value="child" className="bg-gray-900">Child</option>
                                        <option value="spouse" className="bg-gray-900">Spouse</option>
                                        <option value="other" className="bg-gray-900">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Age</label>
                                    <input
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-teal-500/50 transition-all"
                                        placeholder="Age"
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 mt-8">
                                <button type="submit" className="btn-primary w-full !py-4 text-sm font-black uppercase tracking-widest">
                                    Save Profile
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="w-full py-4 text-gray-500 font-bold hover:text-white transition-colors uppercase text-[10px] tracking-[0.2em]"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FamilyProfiles;
