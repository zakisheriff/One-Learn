import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { LanguageContext } from '../context/LanguageContext';
import Navbar from '../components/Navbar';
import { PlayIcon, BookIcon, StarIcon } from '../components/Icons';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const { t } = useContext(LanguageContext);
    const [enrollments, setEnrollments] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', 'Business', 'Technology', 'Creative'];

    const filteredEnrollments = enrollments.filter(enrollment => {
        if (activeCategory === 'All') return true;
        // Check if course category matches or if tags contain the category
        const categoryMatch = enrollment.course.category?.toLowerCase() === activeCategory.toLowerCase();
        const tagMatch = enrollment.course.tags?.some(tag => tag.toLowerCase() === activeCategory.toLowerCase());
        return categoryMatch || tagMatch;
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [enrollmentsRes, certificatesRes] = await Promise.all([
                axios.get('/api/enrollments'),
                axios.get('/api/certificates')
            ]);
            setEnrollments(enrollmentsRes.data.enrollments);
            setCertificates(certificatesRes.data.certificates);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-page">
                <Navbar />
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <Navbar />

            <main className="dashboard-main">
                <div className="container">
                    <header className="dashboard-header">
                        <h1>Welcome back, {user?.fullName}!</h1>
                        <p>Continue your learning journey</p>
                    </header>
                    <div className="container dashboard-container">
                        {/* Header */}
                        <div className="dashboard-header">
                            <div className="dashboard-user-info">
                                <div className="dashboard-avatar">
                                    {user.fullName?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h1>{t('myLearning')}</h1>
                                    <p>{user.fullName}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="dashboard-tabs">
                            <button className="dashboard-tab active">{t('inProgress')}</button>
                            <button className="dashboard-tab">{t('saved')}</button>
                            <button className="dashboard-tab">{t('completed')}</button>
                        </div>

                        {/* Filters */}
                        <div className="dashboard-filters">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    className={`filter-pill ${activeCategory === category ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="dashboard-content">
                            {loading ? (
                                <div className="dashboard-loading">{t('loading')}</div>
                            ) : filteredEnrollments.length > 0 ? (
                                <div className="dashboard-grid">
                                    {filteredEnrollments.map((enrollment) => (
                                        <div key={enrollment.id} className="dashboard-card">
                                            <div className="dashboard-card-image">
                                                <img
                                                    src={enrollment.course.thumbnailUrl || 'https://via.placeholder.com/300x169'}
                                                    alt={enrollment.course.title}
                                                />
                                                <div className="dashboard-card-overlay">
                                                    <Link to={`/course/${enrollment.course.slug}/learn`} className="resume-button">
                                                        <PlayIcon size={16} /> {t('continue')}
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="dashboard-card-body">
                                                <h3>{enrollment.course.title}</h3>
                                                <p className="instructor">FreeCodeCamp</p>
                                                <div className="progress-container">
                                                    <div className="progress-bar">
                                                        <div
                                                            className="progress-fill"
                                                            style={{ width: `${enrollment.progress}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="progress-text">{enrollment.progress}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="dashboard-empty">
                                    <BookIcon size={48} color="#ccc" />
                                    <h3>{t('startLearning')}</h3>
                                    <p>{t('enrollToSee')}</p>
                                    <Link to="/explore" className="btn-primary">
                                        {t('exploreCourses')}
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Certificates Section */}
                        <div id="certificates" className="certificates-section">
                            <h2>My Certificates</h2>
                            {certificates.length > 0 ? (
                                <div className="certificates-grid">
                                    {certificates.map((cert) => (
                                        <div key={cert.id} className="certificate-card">
                                            <div className="certificate-icon">
                                                <StarIcon size={32} color="#b4690e" />
                                            </div>
                                            <div className="certificate-info">
                                                <h3>{cert.course.title}</h3>
                                                <p>Completed on {new Date(cert.issuedAt).toLocaleDateString()}</p>
                                                <Link
                                                    to={`/course/${cert.course.slug}/certificate`}
                                                    className="certificate-link"
                                                >
                                                    {t('downloadCertificate')}
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-certificates">Complete a course to earn a certificate.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
