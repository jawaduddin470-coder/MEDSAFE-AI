import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ReminderProvider } from './context/ReminderContext';
import { useEffect } from 'react';
import { requestNotificationPermission } from './utils/notificationHelper';
import { requestForToken } from './utils/firebase';
import axios from 'axios';
import Layout from './components/Layout';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MedicationList from './pages/MedicationList';
import RiskAnalysis from './pages/RiskAnalysis';
import FamilyProfiles from './pages/FamilyProfiles';
import About from './pages/About';
import Reminders from './pages/Reminders';
import ProtectedRoute from './components/ProtectedRoute';
import MediSafeAssistant from './components/MediSafeAssistant.jsx';
import PageTransition from './components/PageTransition';

function App() {
    const { loading } = useAuth();

    // Request notification permission and FCM token on startup
    useEffect(() => {
        const setupNotifications = async () => {
            await requestNotificationPermission();
            const token = await requestForToken();
            if (token && !loading) {
                try {
                    // Send token to backend
                    await axios.post('/api/auth/fcm-token', { token });
                    console.log('FCM Token synced with backend');
                } catch (err) {
                    console.error('Failed to sync FCM token:', err);
                }
            }
        };
        setupNotifications();
    }, [loading]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading Medsafe AI…</p>
                </div>
            </div>
        );
    }

    return (
        <ReminderProvider>
            <Router>
                <Layout>
                    <PageTransition>
                        <Routes>
                            <Route path="/" element={<Landing />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />

                            {/* Protected Routes */}
                            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                            <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
                            <Route path="/medications" element={<ProtectedRoute><MedicationList /></ProtectedRoute>} />
                            <Route path="/analysis" element={<ProtectedRoute><RiskAnalysis /></ProtectedRoute>} />
                            <Route path="/family" element={<ProtectedRoute><FamilyProfiles /></ProtectedRoute>} />

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </PageTransition>
                </Layout>
                <MediSafeAssistant />
            </Router>
        </ReminderProvider>
    );
}

export default App;

