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
            const { data } = await axios.get('http://localhost:5001/api/medications');
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
            const { data } = await axios.post('http://localhost:5001/api/analysis/check', { medications: medNames });
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
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Medication Risk Awareness</h1>
                <p className="text-gray-500">Analyze your current regimen for potential interactions.</p>
            </div>

            {/* Action Section */}
            <div className="bg-white p-8 rounded-2xl shadow-soft border border-gray-100 text-center space-y-6">
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {medications.map((med, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100">
                            {med.name}
                        </span>
                    ))}
                </div>

                <button
                    onClick={runAnalysis}
                    disabled={loading || medications.length === 0}
                    className={`px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-all flex items-center justify-center mx-auto ${loading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-primary hover:bg-blue-700 text-white shadow-blue-500/30'
                        }`}
                >
                    {loading ? <RefreshCw className="animate-spin mr-2" /> : <Activity className="mr-2" />}
                    {loading ? 'Analyzing...' : 'Analyze Safety Risks'}
                </button>

                {medications.length < 2 && (
                    <p className="text-sm text-amber-500 flex items-center justify-center">
                        <AlertTriangle size={14} className="mr-1" /> Add at least 2 medications to enable analysis.
                    </p>
                )}
            </div>

            {/* Results Section */}
            {analysisResult && (
                <div className="space-y-6 animate-fade-in-up">
                    {/* Score Card */}
                    <div className={`p-8 rounded-2xl border-l-8 shadow-sm ${getRiskColor(analysisResult.riskLevel)}`}>
                        <div className="flex items-center mb-4">
                            {analysisResult.riskLevel === 'High' ? <ShieldAlert size={40} className="mr-4" /> : <CheckCircle size={40} className="mr-4" />}
                            <div>
                                <h2 className="text-2xl font-bold">Risk Level: {analysisResult.riskLevel}</h2>
                                <p className="opacity-90">{analysisResult.summary}</p>
                            </div>
                        </div>
                    </div>

                    {/* Interactions List */}
                    {analysisResult.interactions.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                                <h3 className="font-bold text-gray-700">Identified Interactions</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {analysisResult.interactions.map((interaction, idx) => (
                                    <div key={idx} className="p-6">
                                        <div className="flex items-center mb-2">
                                            <span className="font-bold text-gray-900 mr-2">{interaction.med1}</span>
                                            <span className="text-gray-400 text-sm mx-2">+</span>
                                            <span className="font-bold text-gray-900 mr-2">{interaction.med2}</span>
                                            <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded ml-auto font-medium">{interaction.severity.toUpperCase()}</span>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {interaction.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Disclaimer */}
                    <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm border border-amber-100 flex items-start">
                        <AlertTriangle size={16} className="min-w-[16px] mr-2 mt-0.5" />
                        <p>
                            <strong>Important:</strong> This analysis is computer-generated and may not cover all possible interactions.
                            Risk factors vary by individual. Always consult your healthcare provider.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiskAnalysis;
