import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Pages
import LoginPage from './pages/LoginPage';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetail from './pages/CourseDetail';
import CourseViewer from './pages/CourseViewer';
import Dashboard from './pages/Dashboard';
import QuizPage from './pages/QuizPage';
import CertificatePage from './pages/CertificatePage';
import VerifyPage from './pages/VerifyPage';

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
        <AuthContext.Provider value={{ user, setUser, logout, checkAuth }}>
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<CourseCatalog />} />
                    <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
                    <Route path="/course/:slug" element={<CourseDetail />} />
                    <Route path="/verify" element={<VerifyPage />} />

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

                    {/* 404 */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
        </AuthContext.Provider>
    );
}

export default App;
