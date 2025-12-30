'use client';

import React, { useState, useContext } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthContext } from '../contexts/AuthContext';
import { LanguageContext } from '../contexts/LanguageContext';
import {
    HomeIcon, BookIcon, SearchIcon, DashboardIcon, LogoutIcon,
    MenuIcon, GlobeIcon, CheckIcon, StarIcon,
    BrowseIcon, NotificationIcon, ChevronDownIcon, CoffeeIcon, MapIcon, RocketIcon, TargetIcon
} from './Icons';
import '../styles/Navbar.css';
import Logo from './Logo';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { language, setLanguage, t } = useContext(LanguageContext);
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');

    const [languageOpen, setLanguageOpen] = useState(false);
    const languages = ['English', 'Español', 'Français'];

    const isActive = (path) => pathname === path;

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
                    {/* Mobile Hamburger - shown on mobile only */}
                    <button
                        className="navbar-mobile-toggle"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <MenuIcon size={20} />
                    </button>

                    <Link href="/" className="navbar-logo" onClick={() => window.scrollTo(0, 0)}>
                        <Logo size={18} iconSize={20} />
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
                                <h3>Tech & Science</h3>
                                <Link href="/explore?category=Technology%20%26%20CS" onClick={() => window.scrollTo(0, 0)}>Technology & CS</Link>
                                <Link href="/explore?category=Data%20Science%20%26%20AI" onClick={() => window.scrollTo(0, 0)}>Data Science & AI</Link>
                                <Link href="/explore?category=Math%20%26%20Science" onClick={() => window.scrollTo(0, 0)}>Math & Science</Link>
                            </div>
                            <div className="browse-column">
                                <h3>Business & Skills</h3>
                                <Link href="/explore?category=Business%20%26%20Finance" onClick={() => window.scrollTo(0, 0)}>Business & Finance</Link>
                                <Link href="/explore?category=English%20%26%20Communication" onClick={() => window.scrollTo(0, 0)}>English & Communication</Link>
                                <Link href="/explore?category=School%20Subjects" onClick={() => window.scrollTo(0, 0)}>School Subjects</Link>
                            </div>
                            <div className="browse-column">
                                <h3>Creative & Lifestyle</h3>
                                <Link href="/explore?category=Design%20%26%20Creative" onClick={() => window.scrollTo(0, 0)}>Design & Creative</Link>
                                <Link href="/explore?category=Video%20%26%20Animation" onClick={() => window.scrollTo(0, 0)}>Video & Animation</Link>
                                <Link href="/explore?category=Music%20%26%20Arts" onClick={() => window.scrollTo(0, 0)}>Music & Arts</Link>
                                <Link href="/explore?category=Health%20%26%20Self-Improvement" onClick={() => window.scrollTo(0, 0)}>Health & Self-Improvement</Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Actions - Right Side: Profile first, then Search */}
                <div className="navbar-mobile-actions">
                    <button
                        className="navbar-mobile-search-toggle"
                        onClick={() => setSearchOpen(!searchOpen)}
                        aria-label="Toggle search"
                    >
                        <SearchIcon size={20} />
                    </button>

                    {user && (
                        <div
                            className={`navbar-profile mobile-profile ${profileOpen ? 'open' : ''}`}
                            onClick={() => setProfileOpen(!profileOpen)}
                        >
                            <div className="navbar-avatar">
                                {user.fullName?.charAt(0).toUpperCase() || 'U'}
                            </div>

                            <div className="navbar-profile-dropdown">
                                <div className="profile-header">
                                    <div className="navbar-avatar large">
                                        {user.fullName?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="profile-details">
                                        <h4>{user.fullName || 'User'}</h4>
                                        <p>{user.email}</p>
                                    </div>
                                </div>

                                <Link
                                    href="/dashboard"
                                    className="navbar-dropdown-item"
                                    onClick={() => { setProfileOpen(false); window.scrollTo(0, 0); }}
                                >
                                    <DashboardIcon size={18} />
                                    <span>{t('myLearning')}</span>
                                </Link>

                                <Link
                                    href="/dashboard#certificates"
                                    className="navbar-dropdown-item"
                                    onClick={() => { setProfileOpen(false); window.scrollTo(0, 0); }}
                                >
                                    <StarIcon size={18} />
                                    <span>My Certificates</span>
                                </Link>

                                <div className="navbar-dropdown-divider"></div>

                                <div className="dropdown-section">
                                    <h5>Account</h5>
                                    <Link href="/settings" className="navbar-dropdown-link" onClick={() => { setProfileOpen(false); window.scrollTo(0, 0); }}>Settings & Privacy</Link>
                                    <Link href="/help" className="navbar-dropdown-link" onClick={() => { setProfileOpen(false); window.scrollTo(0, 0); }}>{t('helpCenter')}</Link>
                                </div>

                                <div className="navbar-dropdown-divider"></div>

                                <button className="navbar-dropdown-item" onClick={handleLogout}>
                                    <LogoutIcon size={18} />
                                    <span>{t('signOut')}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Center Section: Search (Desktop) */}
                <div className="navbar-center">
                    <div className="navbar-search">
                        <div className="navbar-search-input-wrapper">
                            <span className="navbar-search-icon"><SearchIcon size={16} /></span>
                            <input
                                type="text"
                                className="navbar-search-input"
                                placeholder={t('searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        window.location.href = `/explore?search=${encodeURIComponent(searchTerm)}`;
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile Search Overlay */}
                {searchOpen && (
                    <div className="navbar-mobile-search-overlay">
                        <div className="navbar-search-input-wrapper mobile">
                            <span className="navbar-search-icon"><SearchIcon size={16} /></span>
                            <input
                                type="text"
                                className="navbar-search-input mobile"
                                placeholder={t('searchPlaceholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        window.location.href = `/explore?search=${encodeURIComponent(searchTerm)}`;
                                        setSearchOpen(false);
                                    }
                                }}
                            />
                            <button
                                className="mobile-search-close"
                                onClick={() => setSearchOpen(false)}
                            >
                                &times;
                            </button>
                        </div>
                    </div>
                )}

                {/* Right Section: Nav Links + Profile */}
                <div className="navbar-right">
                    <div className={`navbar-nav ${mobileMenuOpen ? 'open' : ''}`}>
                        <Link
                            href="/"
                            className={`navbar-link ${isActive('/') ? 'active' : ''}`}
                            onClick={() => { setMobileMenuOpen(false); window.scrollTo(0, 0); }}
                        >
                            <span className="navbar-link-icon"><HomeIcon size={20} /></span>
                            <span className="navbar-link-text">{t('home')}</span>
                        </Link>

                        <Link
                            href="/roadmap"
                            className={`navbar-link ${isActive('/roadmap') ? 'active' : ''}`}
                            onClick={() => { setMobileMenuOpen(false); window.scrollTo(0, 0); }}
                        >
                            <span className="navbar-link-icon"><MapIcon size={20} /></span>
                            <span className="navbar-link-text">Roadmap</span>
                        </Link>

                        <Link
                            href="/atom-path"
                            className={`navbar-link ${isActive('/atom-path') ? 'active' : ''}`}
                            onClick={() => { setMobileMenuOpen(false); window.scrollTo(0, 0); }}
                        >
                            <span className="navbar-link-icon"><TargetIcon size={20} /></span>
                            <span className="navbar-link-text">Atom Path</span>
                        </Link>

                        {user && (
                            <Link
                                href="/dashboard"
                                className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
                                onClick={() => { setMobileMenuOpen(false); window.scrollTo(0, 0); }}
                            >
                                <span className="navbar-link-icon"><BookIcon size={20} /></span>
                                <span className="navbar-link-text">{t('myLearning')}</span>
                            </Link>
                        )}

                        <Link
                            href="/explore"
                            className={`navbar-link ${isActive('/explore') ? 'active' : ''}`}
                            onClick={() => { setMobileMenuOpen(false); window.scrollTo(0, 0); }}
                        >
                            <span className="navbar-link-icon"><BrowseIcon size={20} /></span>
                            <span className="navbar-link-text">Courses</span>
                        </Link>

                        <div className="navbar-language-wrapper">
                            <button
                                className="navbar-link icon-only"
                                onClick={() => setLanguageOpen(!languageOpen)}
                            >
                                <span className="navbar-link-icon"><GlobeIcon size={20} /></span>
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

                        {/* Mobile Auth Links (Logged Out Only) */}
                        {!user && (
                            <div className="mobile-auth-links">
                                <div className="navbar-divider-horizontal"></div>
                                <Link
                                    href="/login"
                                    className="navbar-link"
                                    onClick={() => { setMobileMenuOpen(false); window.scrollTo(0, 0); }}
                                >
                                    <span className="navbar-link-text">{t('signIn')}</span>
                                </Link>
                                <Link
                                    href="/login?mode=signup"
                                    className="navbar-link"
                                    onClick={() => { setMobileMenuOpen(false); window.scrollTo(0, 0); }}
                                >
                                    <span className="navbar-link-text">{t('joinNow')}</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="navbar-divider-vertical"></div>

                    {/* Profile */}
                    {user ? (
                        <div
                            className={`navbar-profile desktop-profile ${profileOpen ? 'open' : ''}`}
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
                                    href="/dashboard"
                                    className="navbar-dropdown-item"
                                    onClick={() => { setProfileOpen(false); window.scrollTo(0, 0); }}
                                >
                                    <DashboardIcon size={18} />
                                    <span>{t('myLearning')}</span>
                                </Link>
                                <Link
                                    href="/dashboard#certificates"
                                    className="navbar-dropdown-item"
                                    onClick={() => { setProfileOpen(false); window.scrollTo(0, 0); }}
                                >
                                    <StarIcon size={18} />
                                    <span>My Certificates</span>
                                </Link>
                                <div className="navbar-dropdown-divider"></div>
                                <div className="dropdown-section">
                                    <h5>Account</h5>
                                    <Link href="/settings" className="navbar-dropdown-link" onClick={() => { setProfileOpen(false); window.scrollTo(0, 0); }}>Settings & Privacy</Link>
                                    <Link href="/help" className="navbar-dropdown-link" onClick={() => { setProfileOpen(false); window.scrollTo(0, 0); }}>{t('helpCenter')}</Link>
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
                            <Link href="/login" className="btn-text" onClick={() => window.scrollTo(0, 0)}>{t('signIn')}</Link>
                            <Link href="/login?mode=signup" onClick={() => window.scrollTo(0, 0)}>
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
