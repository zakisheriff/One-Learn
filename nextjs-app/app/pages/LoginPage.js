import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import '../styles/LoginPage.css';
import Logo from '../components/Logo';

const LoginPage = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const initialMode = searchParams.get('mode');

    const [isLogin, setIsLogin] = useState(initialMode !== 'signup');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setUser, checkAuth } = useContext(AuthContext);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError(''); // Clear error on input change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!isLogin) {
                // Registration validation
                if (!formData.fullName.trim()) {
                    throw new Error('Full name is required');
                }
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Passwords do not match');
                }
                if (formData.password.length < 8) {
                    throw new Error('Password must be at least 8 characters');
                }
            }

            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const body = isLogin
                ? { email: formData.email, password: formData.password }
                : {
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password
                };

            const response = await axios.post(endpoint, body);

            if (response.data.user) {
                // Update auth context with user data
                setUser(response.data.user);
                // Navigate to home
                navigate('/');
            } else {
                // Fallback: check auth status
                await checkAuth();
                navigate('/');
            }

        } catch (err) {
            console.error('Authentication error:', err);
            const backendError = err.response?.data;
            const errorMessage = backendError?.details || backendError?.error || err.message || 'Authentication failed';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        // Initialize Google Sign-In
        if (window.google) {
            // Fix: Clear Google One Tap cool-down state so prompt always shows
            document.cookie = 'g_state=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';

            window.google.accounts.id.initialize({
                client_id: '1063877415823-2a5ml4u8n0sg8lrgsq23b91o38huuu1s.apps.googleusercontent.com',
                callback: handleGoogleCallback
            });

            window.google.accounts.id.prompt(); // Show One Tap dialog
        } else {
            setError('Google Sign-In not loaded. Please refresh the page.');
        }
    };

    const handleGoogleCallback = async (response) => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ credential: response.credential })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Google Sign-In failed');
            }

            // Success - redirect to home
            window.location.href = '/';

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <Link to="/" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                            <Logo size={28} iconSize={32} />
                        </Link>
                        <p className="tagline">
                            {isLogin ? 'Welcome back' : 'Start your learning journey'}
                        </p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="form-group">
                                <label htmlFor="fullName">Full Name</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="John Doe"
                                    required={!isLogin}
                                    autoComplete="name"
                                />
                                <span className="input-hint">
                                    This name will appear on your certificates
                                </span>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="you@example.com"
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    required
                                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {!isLogin && (
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        required={!isLogin}
                                        autoComplete="new-password"
                                    />
                                    {/* Using same toggle for both for simplicity, or could add separate state */}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    <div className="divider">
                        <span>or</span>
                    </div>

                    <button
                        type="button"
                        className="btn-google"
                        onClick={handleGoogleSignIn}
                    >
                        <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign in with Google
                    </button>

                    <div className="toggle-mode">
                        {isLogin ? (
                            <p>
                                Don't have an account?{' '}
                                <button
                                    type="button"
                                    className="link-button"
                                    onClick={() => setIsLogin(false)}
                                >
                                    Sign up
                                </button>
                            </p>
                        ) : (
                            <p>
                                Already have an account?{' '}
                                <button
                                    type="button"
                                    className="link-button"
                                    onClick={() => setIsLogin(true)}
                                >
                                    Sign in
                                </button>
                            </p>
                        )}
                    </div>

                    <div className="back-to-home">
                        <Link to="/">← Back to courses</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
