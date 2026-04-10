import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ReminderProvider } from './context/ReminderContext';
import { requestNotificationPermission } from './utils/notificationHelper';
import { requestForToken } from './utils/firebase';
import axios from 'axios';
import Layout from './components/Layout';
import ReminderAlertModal from './components/ReminderAlertModal';
import MedSureeAssistant from './components/MedSureeAssistant';
import MedSureeReminderBanner from './components/MedSureeReminderBanner';
import ErrorBoundary from './components/ErrorBoundary';

// Eager load auth routes
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy load feature components for performance
const Landing = lazy(() => import('./pages/Landing'));
const About = lazy(() => import('./pages/About'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Reminders = lazy(() => import('./pages/Reminders'));
const MedicationList = lazy(() => import('./pages/MedicationList'));
const RiskAnalysis = lazy(() => import('./pages/RiskAnalysis'));
const FamilyProfiles = lazy(() => import('./pages/FamilyProfiles'));
const Pricing = lazy(() => import('./pages/Pricing'));
const PrescriptionScan = lazy(() => import('./pages/PrescriptionScan'));
const DiagnosticsHub = lazy(() => import('./pages/DiagnosticsHub'));

// App Loader
const AppLoader = () => (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0a0e1a]">
        <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 relative">
                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-center">
                <p className="text-gray-900 dark:text-white font-black text-lg uppercase italic">Loading MedSuree</p>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">AI Medication Safety Platform</p>
            </div>
        </div>
    </div>
);

// RequireAuth Wrapper - Redirects to login if unauthenticated
const RequireAuth = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <AppLoader />;
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

// PublicOnly Wrapper - Redirects to dashboard if already authenticated
const PublicOnly = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <AppLoader />;
    if (user) return <Navigate to="/dashboard" replace />;
    return children;
};

function App() {
    const { user, loading } = useAuth();

    useEffect(() => {
        const setupNotifications = async () => {
            await requestNotificationPermission();
            const token = await requestForToken();
            if (token && !loading) {
                try {
                    await axios.post('/api/auth/fcm-token', { token });
                    console.log('FCM Token synced with backend');
                } catch (err) {
                    console.warn('Failed to sync FCM token (non-critical):', err.message);
                }
            }
        };
        setupNotifications();
    }, [loading]);

    if (loading) return <AppLoader />;

    return (
        <ErrorBoundary>
        <ReminderProvider>
            <Router>
                <Layout>
                    <Suspense fallback={<AppLoader />}>
                        <Routes>
                            {/* Protected Landing & About */}
                            <Route path="/" element={<RequireAuth><Landing /></RequireAuth>} />
                            <Route path="/about" element={<RequireAuth><About /></RequireAuth>} />

                            {/* Public Auth Routes */}
                            <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
                            <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

                            {/* Protected Routes */}
                            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                            <Route path="/reminders" element={<RequireAuth><Reminders /></RequireAuth>} />
                            <Route path="/medications" element={<RequireAuth><MedicationList /></RequireAuth>} />
                            <Route path="/analysis" element={<RequireAuth><RiskAnalysis /></RequireAuth>} />
                            <Route path="/family" element={<RequireAuth><FamilyProfiles /></RequireAuth>} />
                            <Route path="/pricing" element={<RequireAuth><Pricing /></RequireAuth>} />
                            <Route path="/prescription-scan" element={<RequireAuth><PrescriptionScan /></RequireAuth>} />
                            <Route path="/diagnostics" element={<RequireAuth><DiagnosticsHub /></RequireAuth>} />

                            {/* Catch-all redirects to Home/Login */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Suspense>
                </Layout>

                {/* Global floating components - Protected */}
                {user && (
                    <>
                        <MedSureeAssistant />
                        <MedSureeReminderBanner />
                        <ReminderAlertModal />
                    </>
                )}
            </Router>
        </ReminderProvider>
        </ErrorBoundary>
    );
}

export default App;
