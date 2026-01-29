import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Placeholder Pages (will be replaced by real ones)
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MedicationList from './pages/MedicationList';
import RiskAnalysis from './pages/RiskAnalysis';
import FamilyProfiles from './pages/FamilyProfiles';
import About from './pages/About';
import ProtectedRoute from './components/ProtectedRoute';
import MediSafeAssistant from './components/MediSafeAssistant.jsx';
import PageTransition from './components/PageTransition';

function App() {
    const { loading } = useAuth();

    if (loading) {
        return <div className="flex h-screen items-center justify-center text-primary">Loading...</div>;
    }

    return (
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
                        <Route path="/medications" element={<ProtectedRoute><MedicationList /></ProtectedRoute>} />
                        <Route path="/analysis" element={<ProtectedRoute><RiskAnalysis /></ProtectedRoute>} />
                        <Route path="/family" element={<ProtectedRoute><FamilyProfiles /></ProtectedRoute>} />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </PageTransition>
            </Layout>
            <MediSafeAssistant />
        </Router>
    );
}

export default App;
