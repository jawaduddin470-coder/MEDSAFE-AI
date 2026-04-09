import React, { useState, useEffect } from 'react';
import { Plus, Trash2, User, Heart, Users, UserPlus, ShieldPlus, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { API_URL as API_BASE } from '../config/apiConfig';

const FamilyProfiles = () => {
    const { t } = useLanguage();
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
            const res = await axios.get(`${API_BASE}/family`, config);
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
                await axios.delete(`${API_BASE}/family/${id}`, config);
                setMembers(members.filter((member) => member._id !== id));
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE}/family`, formData, config);
            setMembers([...members, res.data]);
            setShowModal(false);
            setFormData({ name: '', relation: '', age: '' });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-24">
            {/* Hero Header */}
            <div className="relative py-12 px-10 rounded-[3rem] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-teal-400/10 backdrop-blur-3xl -z-10" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 blur-[100px] -z-10 animate-pulse" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 text-[10px] font-black uppercase tracking-[0.3em]">
                            <Users size={12} /> Guarded Network
                        </div>
                        <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">
                            Family <span className="text-indigo-500">Hub</span>
                        </h1>
                        <p className="max-w-md text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                            Centralize the health monitoring of your entire family.
                            Create independent profiles for synchronized medication safety.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowModal(true)}
                        className="group relative flex items-center gap-4 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all duration-500 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-105 active:scale-95"
                    >
                        <UserPlus size={20} className="group-hover:rotate-12 transition-transform" />
                        Add New Member
                        <div className="absolute inset-0 rounded-[2rem] bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>
            </div>

            {/* Profiles Container */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Main User Profile Card (Read Only here or distinct) */}
                <div className="glass-card p-8 rounded-[3rem] border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 opacity-50" />
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-20 h-20 rounded-[2rem] bg-indigo-500/10 border-2 border-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-700">
                            <ShieldPlus size={40} />
                        </div>
                        <span className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest">Master Node</span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic">{user?.name || 'Main Account'}</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2 mb-6">Self Profile • Admin</p>
                    <div className="flex items-center gap-2 text-teal-400 text-[10px] font-black uppercase tracking-widest">
                        <Heart size={14} className="animate-pulse" /> Safety Shield Active
                    </div>
                </div>

                {loading ? (
                    Array(2).fill(0).map((_, i) => (
                        <div key={i} className="glass-card p-10 rounded-[3rem] border-white/5 flex items-center justify-center animate-pulse min-h-[300px]">
                            <div className="w-12 h-12 border-4 border-white/5 border-t-indigo-500 rounded-full animate-spin" />
                        </div>
                    ))
                ) : members.length === 0 ? (
                    <div className="lg:col-span-2 flex flex-col items-center justify-center p-20 glass-card rounded-[3rem] border-white/5 border-dashed border-2 text-center opacity-60">
                        <div className="bg-white/5 p-8 rounded-full mb-6 text-gray-500">
                            <Users size={64} />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase italic tracking-widest mb-2">No Nodes Connected</h3>
                        <p className="text-sm text-gray-500 max-w-xs uppercase font-bold tracking-tight">Expand your safety network by adding family members</p>
                    </div>
                ) : (
                    members.map(member => (
                        <div key={member._id} className="glass-card p-8 rounded-[3rem] border-white/5 relative overflow-hidden group transition-all duration-700 hover:bg-white/[0.05] hover:-translate-y-3 shadow-xl hover:shadow-indigo-500/10">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/40 to-pink-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <div className="flex justify-between items-start mb-8">
                                <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                                    <User size={40} />
                                </div>
                                <button
                                    onClick={() => handleDelete(member._id)}
                                    className="p-3 rounded-2xl bg-red-500/5 text-red-500/30 hover:text-red-500 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-500/20"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic group-hover:text-purple-400 transition-colors">{member.name}</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2 mb-8">
                                {member.relation} • {member.age} Y/O Node
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Status</span>
                                </div>
                                <ChevronRight size={18} className="text-white/20 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl flex items-center justify-center z-[100] p-4 animate-fadeIn">
                    <div
                        className="absolute inset-0"
                        onClick={() => setShowModal(false)}
                    />
                    <div className="glass-card rounded-[3.5rem] w-full max-w-lg p-12 border-white/10 relative overflow-hidden shadow-3xl animate-slideUp">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-400" />

                        <div className="flex items-center gap-5 mb-10">
                            <div className="p-4 rounded-3xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
                                <UserPlus size={32} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic">New Profile</h2>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Initializing health node</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Display Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input-modern !py-5 text-lg font-bold"
                                    placeholder="e.g. John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Relation</label>
                                    <select
                                        required
                                        className="input-modern appearance-none !py-5 font-bold"
                                        value={formData.relation}
                                        onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                                    >
                                        <option value="">Status...</option>
                                        <option value="Parent">Parent</option>
                                        <option value="Child">Child</option>
                                        <option value="Spouse">Spouse</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-2">Current Age</label>
                                    <input
                                        type="number"
                                        className="input-modern !py-5 font-bold"
                                        placeholder="Age"
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 pt-6">
                                <button type="submit" className="btn-primary hover-glow w-full !py-5 text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-indigo-600/30">
                                    Initialize Node
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="w-full py-4 text-gray-500 font-black hover:text-white transition-colors uppercase text-[10px] tracking-[0.3em]"
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
