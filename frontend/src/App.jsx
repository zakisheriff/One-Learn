import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { LanguageProvider } from './context/LanguageContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetail from './pages/CourseDetail';
import CourseViewer from './pages/CourseViewer';
import Dashboard from './pages/Dashboard';
import QuizPage from './pages/QuizPage';
import CertificatePage from './pages/CertificatePage';
import VerifyPage from './pages/VerifyPage';
import HelpCenter from './pages/HelpCenter';
import SettingsPage from './pages/SettingsPage';
import InfoPage from './pages/InfoPage';
import RoadmapPage from './pages/RoadmapPage';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Context for authentication
export const AuthContext = React.createContext(null);

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check authentication status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await axios.get('/api/auth/me');
            setUser(response.data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                fontSize: '1.25rem',
                color: 'var(--color-text-secondary)'
            }}>
                Loading...
            </div>
        );
    }

    return (
        <LanguageProvider>
            <AuthContext.Provider value={{ user, setUser, logout, checkAuth }}>
                <BrowserRouter>
                    <ScrollToTop />
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/explore" element={<CourseCatalog />} />
                        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
                        <Route path="/course/:slug" element={<CourseDetail />} />
                        <Route path="/verify" element={<VerifyPage />} />
                        <Route path="/roadmap" element={<RoadmapPage />} />
                        <Route path="/roadmap/:id" element={<RoadmapPage />} />

                        {/* Protected routes */}
                        <Route
                            path="/dashboard"
                            element={user ? <Dashboard /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/course/:slug/learn"
                            element={user ? <CourseViewer /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/course/:slug/quiz"
                            element={user ? <QuizPage /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/course/:slug/certificate"
                            element={user ? <CertificatePage /> : <Navigate to="/login" />}
                        />
                        <Route path="/help" element={<HelpCenter />} />
                        <Route path="/settings" element={user ? <SettingsPage /> : <Navigate to="/login" />} />

                        {/* Static Pages */}
                        <Route path="/about" element={<InfoPage pageKey="about" />} />
                        <Route path="/careers" element={<InfoPage pageKey="careers" />} />
                        <Route path="/press" element={<InfoPage pageKey="press" />} />
                        <Route path="/blog" element={<InfoPage pageKey="blog" />} />
                        <Route path="/contact" element={<InfoPage pageKey="contact" />} />
                        <Route path="/community" element={<InfoPage pageKey="community" />} />
                        <Route path="/accessibility" element={<InfoPage pageKey="accessibility" />} />
                        <Route path="/privacy" element={<InfoPage pageKey="privacy" />} />
                        <Route path="/terms" element={<InfoPage pageKey="terms" />} />
                        <Route path="/cookies" element={<InfoPage pageKey="cookies" />} />
                        <Route path="/security" element={<InfoPage pageKey="security" />} />

                        {/* 404 */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                    <Footer />
                </BrowserRouter>
            </AuthContext.Provider>
        </LanguageProvider>
    );
}

export default App;
