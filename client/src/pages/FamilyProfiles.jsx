import React, { useState, useEffect } from 'react';
import { Plus, Trash2, User, Heart } from 'lucide-react';
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
            const res = await axios.get('http://localhost:5001/api/family', config);
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
                await axios.delete(`http://localhost:5001/api/family/${id}`, config);
                setMembers(members.filter((member) => member._id !== id));
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5001/api/family', formData, config);
            setMembers([...members, res.data]);
            setShowModal(false);
            setFormData({ name: '', relation: '', age: '' });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Family Profiles</h1>
                    <p className="text-gray-600">Manage medication safety for your loved ones.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center"
                >
                    <Plus size={20} className="mr-2" />
                    Add Member
                </button>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : members.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                    <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No family members yet</h3>
                    <p className="text-gray-500 mb-6">Add a dependent to start tracking their safety.</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="text-primary font-medium hover:underline"
                    >
                        Add your first member
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {members.map((member) => (
                        <div key={member._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group hover:shadow-md transition-shadow">
                            <button
                                onClick={() => handleDelete(member._id)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={18} />
                            </button>
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
                                    <p className="text-sm text-gray-500 capitalize">{member.relation} • {member.age} years</p>
                                </div>
                            </div>
                            <div className="border-t border-gray-100 pt-4 mt-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Medications</span>
                                    <span className="font-medium bg-gray-100 px-2 py-1 rounded-md">
                                        {member.medications?.length || 0} Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold mb-4">Add Family Member</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                                    <select
                                        required
                                        className="input-field"
                                        value={formData.relation}
                                        onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                                    >
                                        <option value="">Select...</option>
                                        <option value="parent">Parent</option>
                                        <option value="child">Child</option>
                                        <option value="spouse">Spouse</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={formData.age}
                                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Save Profile
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
