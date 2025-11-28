import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { LanguageContext } from '../context/LanguageContext';
import {
    HomeIcon, BookIcon, SearchIcon, DashboardIcon, LogoutIcon,
    MenuIcon, GlobeIcon, CheckIcon, StarIcon,
    BrowseIcon, NotificationIcon, ChevronDownIcon
} from './Icons';
import '../styles/Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { language, setLanguage, t } = useContext(LanguageContext);
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [languageOpen, setLanguageOpen] = useState(false);
    const languages = ['English', 'Español', 'Français'];

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        setProfileOpen(false);
        setMobileMenuOpen(false);
    };

    const handleLanguageSelect = (lang) => {
        setLanguage(lang);
        setLanguageOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Left Section: Logo + Browse */}
                <div className="navbar-left">
                    <Link to="/" className="navbar-logo">
                        <div className="navbar-logo-icon">YL</div>
                        <span className="navbar-logo-text">YouLearn</span>
                    </Link>

                    <div className="navbar-divider"></div>

                    <div className="navbar-browse">
                        <button className="browse-button">
                            <BrowseIcon size={20} />
                            <span>{t('browse')}</span>
                            <ChevronDownIcon size={14} />
                        </button>
                        <div className="browse-dropdown">
                            <div className="browse-column">
                                <h3>{t('programming')}</h3>
                                <Link to="/explore?search=python">Python</Link>
                                <Link to="/explore?search=java">Java</Link>
                                <Link to="/explore?search=javascript">JavaScript</Link>
                            </div>
                            <div className="browse-column">
                                <h3>{t('webDev')}</h3>
                                <Link to="/explore?search=web">Full Stack</Link>
                                <Link to="/explore?search=responsive">Responsive Design</Link>
                                <Link to="/explore?search=frontend">Frontend</Link>
                            </div>
                            <div className="browse-column">
                                <h3>{t('technology')}</h3>
                                <Link to="/explore?search=algorithms">Algorithms</Link>
                                <Link to="/explore?search=data">Data Structures</Link>
                                <Link to="/explore?search=development">Software Development</Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="navbar-mobile-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <MenuIcon size={24} />
                </button>

                {/* Center Section: Search */}
                <div className="navbar-center">
                    <div className={`navbar-search ${searchOpen ? 'open' : ''}`}>
                        <div className="navbar-search-input-wrapper">
                            <span className="navbar-search-icon"><SearchIcon size={16} /></span>
                            <input
                                type="text"
                                className="navbar-search-input"
                                placeholder={t('searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => setSearchOpen(true)}
                                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        window.location.href = `/explore?search=${encodeURIComponent(searchTerm)}`;
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Section: Nav Links + Profile */}
                <div className="navbar-right">
                    <div className={`navbar-nav ${mobileMenuOpen ? 'open' : ''}`}>
                        <Link
                            to="/"
                            className={`navbar-link ${isActive('/') ? 'active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="navbar-link-icon"><HomeIcon size={24} /></span>
                            <span className="navbar-link-text">{t('home')}</span>
                        </Link>

                        {user && (
                            <Link
                                to="/dashboard"
                                className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span className="navbar-link-icon"><BookIcon size={24} /></span>
                                <span className="navbar-link-text">{t('myLearning')}</span>
                            </Link>
                        )}

                        <button className="navbar-link icon-only">
                            <span className="navbar-link-icon"><NotificationIcon size={24} /></span>
                            <span className="navbar-link-text">{t('notifications')}</span>
                        </button>

                        <div className="navbar-language-wrapper">
                            <button
                                className="navbar-link icon-only"
                                onClick={() => setLanguageOpen(!languageOpen)}
                            >
                                <span className="navbar-link-icon"><GlobeIcon size={24} /></span>
                                <span className="navbar-link-text">{language}</span>
                            </button>
                            {languageOpen && (
                                <div className="language-dropdown">
                                    {languages.map(lang => (
                                        <button
                                            key={lang}
                                            className={`language-option ${language === lang ? 'active' : ''}`}
                                            onClick={() => handleLanguageSelect(lang)}
                                        >
                                            {lang}
                                            {language === lang && <CheckIcon size={16} />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="navbar-divider-vertical"></div>

                    {/* Profile */}
                    {user ? (
                        <div
                            className={`navbar-profile ${profileOpen ? 'open' : ''}`}
                            onClick={() => setProfileOpen(!profileOpen)}
                        >
                            <div className="navbar-avatar">
                                {user.fullName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="navbar-profile-info">
                                <span className="navbar-profile-label">{t('me')}</span>
                                <span className="navbar-profile-arrow"><ChevronDownIcon size={12} /></span>
                            </div>

                            {/* Dropdown */}
                            <div className="navbar-profile-dropdown">
                                <div className="profile-header">
                                    <div className="navbar-avatar large">
                                        {user.fullName?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="profile-details">
                                        <h4>{user.fullName}</h4>
                                        <p>Student</p>
                                    </div>
                                </div>
                                <Link
                                    to="/dashboard"
                                    className="navbar-dropdown-item"
                                    onClick={() => setProfileOpen(false)}
                                >
                                    <DashboardIcon size={18} />
                                    <span>{t('myLearning')}</span>
                                </Link>
                                <Link
                                    to="/dashboard#certificates"
                                    className="navbar-dropdown-item"
                                    onClick={() => setProfileOpen(false)}
                                >
                                    <StarIcon size={18} />
                                    <span>My Certificates</span>
                                </Link>
                                <div className="navbar-dropdown-divider"></div>
                                <div className="dropdown-section">
                                    <h5>Account</h5>
                                    <Link to="/settings" className="navbar-dropdown-link">{t('settings')}</Link>
                                    <Link to="/help" className="navbar-dropdown-link">{t('helpCenter')}</Link>
                                </div>
                                <div className="navbar-dropdown-divider"></div>
                                <button
                                    className="navbar-dropdown-item logout"
                                    onClick={handleLogout}
                                >
                                    <LogoutIcon size={18} />
                                    <span>{t('signOut')}</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn-text">{t('signIn')}</Link>
                            <Link to="/login?mode=signup">
                                <button className="btn-primary-small">
                                    {t('joinNow')}
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
