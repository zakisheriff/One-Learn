import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../App';
import { LanguageContext } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import {
    UserIcon, NotificationIcon, LockIcon, CreditCardIcon,
    CoffeeIcon, ChevronRightIcon
} from '../components/Icons';
import axios from 'axios';
import '../styles/SettingsPage.css';

const SettingsPage = () => {
    const { user, setUser } = useContext(AuthContext);
    const { t } = useContext(LanguageContext);
    const [activeSection, setActiveSection] = useState('account');

    // Form states
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setFullName(user.fullName);
            setEmail(user.email);
        }
    }, [user]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('/api/auth/profile', { fullName, email });
            setUser({ ...user, ...response.data.user });
            setIsEditingProfile(false);
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put('/api/auth/password', { currentPassword, newPassword });
            setIsChangingPassword(false);
            setCurrentPassword('');
            setNewPassword('');
            setMessage({ type: 'success', text: 'Password updated successfully' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update password' });
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await axios.delete('/api/auth/account');
            setUser(null);
            window.location.href = '/';
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to delete account' });
        }
    };

    const scrollToSection = (id) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className="settings-page">
            <Navbar />
            <main className="settings-main">
                <div className="settings-container">
                    <div className="settings-sidebar">
                        <div className="settings-sidebar-header">
                            <h2>{t('settings')}</h2>
                        </div>
                        <nav className="settings-nav">
                            <button
                                className={activeSection === 'account' ? 'active' : ''}
                                onClick={() => scrollToSection('account')}
                            >
                                <span className="nav-icon"><UserIcon size={20} /></span>
                                <span className="nav-text">{t('account')}</span>
                                <span className="nav-chevron"><ChevronRightIcon size={16} /></span>
                            </button>
                            <button
                                className={activeSection === 'notifications' ? 'active' : ''}
                                onClick={() => scrollToSection('notifications')}
                            >
                                <span className="nav-icon"><NotificationIcon size={20} /></span>
                                <span className="nav-text">{t('notificationsSettings')}</span>
                                <span className="nav-chevron"><ChevronRightIcon size={16} /></span>
                            </button>
                            <button
                                className={activeSection === 'privacy' ? 'active' : ''}
                                onClick={() => scrollToSection('privacy')}
                            >
                                <span className="nav-icon"><LockIcon size={20} /></span>
                                <span className="nav-text">{t('privacy')}</span>
                                <span className="nav-chevron"><ChevronRightIcon size={16} /></span>
                            </button>
                            <button
                                className={activeSection === 'billing' ? 'active' : ''}
                                onClick={() => scrollToSection('billing')}
                            >
                                <span className="nav-icon"><CreditCardIcon size={20} /></span>
                                <span className="nav-text">{t('billing')}</span>
                                <span className="nav-chevron"><ChevronRightIcon size={16} /></span>
                            </button>
                            <button
                                className={activeSection === 'support' ? 'active' : ''}
                                onClick={() => scrollToSection('support')}
                            >
                                <span className="nav-icon"><CoffeeIcon size={20} /></span>
                                <span className="nav-text">Support</span>
                                <span className="nav-chevron"><ChevronRightIcon size={16} /></span>
                            </button>
                        </nav>
                    </div>

                    <div className="settings-content">
                        {message.text && (
                            <div className={`settings-message ${message.type}`}>
                                {message.text}
                                <button onClick={() => setMessage({ type: '', text: '' })}>×</button>
                            </div>
                        )}

                        <section id="account" className="settings-section">
                            <h3>Account Information</h3>
                            <div className="settings-card">
                                {/* Profile Edit Form */}
                                {isEditingProfile ? (
                                    <form onSubmit={handleProfileUpdate} className="edit-form">
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email Address</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-actions">
                                            <button type="button" onClick={() => setIsEditingProfile(false)} className="cancel-btn">Cancel</button>
                                            <button type="submit" className="save-btn">Save Changes</button>
                                        </div>
                                    </form>
                                ) : (
                                    <>
                                        <div className="setting-row">
                                            <div className="setting-info">
                                                <label>Full Name</label>
                                                <p>{user?.fullName}</p>
                                            </div>
                                            <button className="edit-btn" onClick={() => setIsEditingProfile(true)}>Edit</button>
                                        </div>
                                        <div className="setting-row">
                                            <div className="setting-info">
                                                <label>Email Address</label>
                                                <p>{user?.email}</p>
                                            </div>
                                            <button className="edit-btn" onClick={() => setIsEditingProfile(true)}>Change</button>
                                        </div>
                                    </>
                                )}

                                {/* Password Change Form */}
                                {isChangingPassword ? (
                                    <form onSubmit={handlePasswordUpdate} className="edit-form password-form">
                                        <div className="form-group">
                                            <label>Current Password</label>
                                            <input
                                                type="password"
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>New Password</label>
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                minLength="8"
                                                required
                                            />
                                        </div>
                                        <div className="form-actions">
                                            <button type="button" onClick={() => setIsChangingPassword(false)} className="cancel-btn">Cancel</button>
                                            <button type="submit" className="save-btn">Update Password</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="setting-row">
                                        <div className="setting-info">
                                            <label>Password</label>
                                            <p>••••••••</p>
                                        </div>
                                        <button className="edit-btn" onClick={() => setIsChangingPassword(true)}>Change</button>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section id="notifications" className="settings-section">
                            <h3>Notifications</h3>
                            <div className="settings-card">
                                <div className="setting-row checkbox-row">
                                    <div className="setting-info">
                                        <label>Email Notifications</label>
                                        <p>Receive emails about your progress and new courses.</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                                <div className="setting-row checkbox-row">
                                    <div className="setting-info">
                                        <label>Course Recommendations</label>
                                        <p>Get personalized course recommendations.</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                        </section>

                        <section id="privacy" className="settings-section">
                            <h3>Privacy</h3>
                            <div className="settings-card">
                                <div className="setting-row checkbox-row">
                                    <div className="setting-info">
                                        <label>Profile Visibility</label>
                                        <p>Allow others to see your profile and certificates.</p>
                                    </div>
                                    <label className="switch">
                                        <input type="checkbox" defaultChecked />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                                <div className="setting-row">
                                    <div className="setting-info">
                                        <label>Data Download</label>
                                        <p>Download a copy of your personal data.</p>
                                    </div>
                                    <button className="edit-btn" onClick={() => alert('Data download requested. We will email you shortly.')}>Request</button>
                                </div>
                            </div>
                        </section>
                        <section id="billing" className="settings-section">
                            <h3>Billing & Subscription</h3>
                            <div className="settings-card">
                                <div className="billing-header">
                                    <div className="plan-info">
                                        <h4>Free Plan</h4>
                                        <p>You are currently on the free plan.</p>
                                    </div>
                                    <span className="plan-badge">Active</span>
                                </div>
                                <div className="setting-row">
                                    <div className="setting-info">
                                        <label>Payment Method</label>
                                        <p>No payment method required for free plan.</p>
                                    </div>
                                    <button className="edit-btn" onClick={() => alert('This is a free platform!')}>Add Method</button>
                                </div>
                                <div className="setting-row">
                                    <div className="setting-info">
                                        <label>Billing History</label>
                                        <p>View your past invoices and receipts.</p>
                                    </div>
                                    <button className="edit-btn">View History</button>
                                </div>
                            </div>
                        </section>

                        <section id="support" className="settings-section">
                            <h3>Support</h3>
                            <div className="settings-card support-card">
                                <div className="support-content">
                                    <div className="support-icon">
                                        <CoffeeIcon size={32} color="#FFDD00" />
                                    </div>
                                    <div className="support-text">
                                        <h4>Enjoying You Learn?</h4>
                                        <p>If you find this platform helpful, consider buying me a coffee to support future development!</p>
                                    </div>
                                    <a href="https://buymeacoffee.com/zakisherifw" target="_blank" rel="noopener noreferrer" className="coffee-btn">
                                        Buy Me a Coffee
                                    </a>
                                </div>
                            </div>
                        </section>

                        <section id="danger-zone" className="settings-section">
                            <h3 className="danger-title">Danger Zone</h3>
                            <div className="settings-card danger-card">
                                <div className="setting-row">
                                    <div className="setting-info">
                                        <label className="danger-text">Delete Account</label>
                                        <p>Permanently delete your account and all of your content.</p>
                                    </div>
                                    <button
                                        className="delete-btn"
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                                                handleDeleteAccount();
                                            }
                                        }}
                                    >
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;
