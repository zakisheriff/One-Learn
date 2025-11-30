import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { LanguageContext } from '../context/LanguageContext';
import { PlayIcon, BookIcon, StarIcon, TargetIcon } from '../components/Icons';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const { t } = useContext(LanguageContext);
    const [enrollments, setEnrollments] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [roadmaps, setRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('in-progress');
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', 'Python', 'JavaScript', 'Web Design', 'Full Stack', 'Java'];

    const filteredEnrollments = enrollments.filter(enrollment => {
        // 1. Filter by Tab
        if (activeTab === 'in-progress' && enrollment.progress >= 100) return false;
        if (activeTab === 'completed' && enrollment.progress < 100) return false;
        if (activeTab === 'saved') return false;

        // 2. Filter by Category
        if (activeCategory === 'All') return true;
        return enrollment.course.title.toLowerCase().includes(activeCategory.toLowerCase());
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tabParam = params.get('tab');
        if (tabParam && ['in-progress', 'saved', 'completed'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [enrollmentsRes, certificatesRes, roadmapsRes] = await Promise.all([
                axios.get('/api/enrollments'),
                axios.get('/api/certificates'),
                axios.get('/api/roadmaps')
            ]);
            setEnrollments(enrollmentsRes.data.enrollments);
            setCertificates(certificatesRes.data.certificates);
            setRoadmaps(roadmapsRes.data.roadmaps);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRoadmap = async (id) => {
        if (!window.confirm('Are you sure you want to delete this roadmap?')) return;

        try {
            await axios.delete(`/api/roadmaps/${id}`);
            setRoadmaps(roadmaps.filter(r => r.id !== id));
        } catch (err) {
            console.error('Failed to delete roadmap:', err);
            alert('Failed to delete roadmap.');
        }
    };

    const renderRoadmapCard = (roadmap) => (
        <div key={roadmap.id} className="enrollment-card">
            <div className="enrollment-thumbnail" style={{
                background: 'linear-gradient(135deg, #1c1c1e 0%, #2c2c2e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'radial-gradient(circle at 50% 50%, rgba(0, 113, 227, 0.2) 0%, transparent 70%)'
                }}></div>
                <TargetIcon size={64} color="#0071e3" />
            </div>
            <div className="enrollment-content">
                <h3>{roadmap.title}</h3>
                <p className="instructor">AI Personalized Path</p>
                <div style={{ fontSize: '13px', color: '#86868b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BookIcon size={14} /> {roadmap.content.steps.length} Steps
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <Link to={`/roadmap/${roadmap.id}`} className="continue-button" style={{ flex: 1 }}>
                        View Path
                    </Link>
                    <button
                        onClick={() => handleDeleteRoadmap(roadmap.id)}
                        className="continue-button"
                        style={{
                            flex: '0 0 auto',
                            borderColor: '#ff3b30',
                            color: '#ff3b30',
                            padding: '8px 12px'
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">

            <main className="dashboard-main">
                <div className="container">
                    <header className="dashboard-header">
                        <h1>Welcome back, {user?.fullName}!</h1>
                        <p>Continue your learning journey</p>
                    </header>
                    <div className="dashboard-container">
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
                            <button
                                className={`dashboard-tab ${activeTab === 'in-progress' ? 'active' : ''}`}
                                onClick={() => setActiveTab('in-progress')}
                            >
                                {t('inProgress')}
                            </button>
                            <button
                                className={`dashboard-tab ${activeTab === 'saved' ? 'active' : ''}`}
                                onClick={() => setActiveTab('saved')}
                            >
                                {t('saved')}
                            </button>
                            <button
                                className={`dashboard-tab ${activeTab === 'completed' ? 'active' : ''}`}
                                onClick={() => setActiveTab('completed')}
                            >
                                {t('completed')}
                            </button>
                        </div>

                        {/* Filters */}
                        {activeTab !== 'saved' && (
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
                        )}

                        {/* Content */}
                        <div className="dashboard-content">
                            {loading ? (
                                <div className="dashboard-loading">{t('loading')}</div>
                            ) : activeTab === 'saved' ? (
                                roadmaps.length > 0 ? (
                                    <div className="enrollments-grid">
                                        {roadmaps.map(renderRoadmapCard)}
                                    </div>
                                ) : (
                                    <div className="dashboard-empty">
                                        <StarIcon size={48} color="#ccc" />
                                        <h3>No saved roadmaps</h3>
                                        <p>Generate a personalized learning path to see it here.</p>
                                        <Link to="/roadmap" className="btn-primary">
                                            Generate Roadmap
                                        </Link>
                                    </div>
                                )
                            ) : filteredEnrollments.length > 0 ? (
                                <div className="enrollments-grid">
                                    {filteredEnrollments.map((enrollment) => (
                                        <div key={enrollment.id} className="enrollment-card">
                                            <div className="enrollment-thumbnail">
                                                <img
                                                    src={enrollment.course.thumbnailUrl || 'https://via.placeholder.com/300x169'}
                                                    alt={enrollment.course.title}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x169'; }}
                                                />
                                                <div className="progress-overlay">
                                                    <div className="progress-bar">
                                                        <div
                                                            className="progress-fill"
                                                            style={{ width: `${enrollment.progress}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="progress-text">{enrollment.progress}%</span>
                                                </div>
                                            </div>
                                            <div className="enrollment-content">
                                                <h3>{enrollment.course.title}</h3>
                                                <p className="instructor">{enrollment.course.instructor || 'YouLearn Instructor'}</p>
                                                <Link to={`/course/${enrollment.course.slug}/learn`} className="continue-button">
                                                    <PlayIcon size={16} /> {t('continue')}
                                                </Link>
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
                                        <Link
                                            key={cert.id}
                                            to={`/course/${cert.courseSlug}/certificate`}
                                            className="certificate-card"
                                        >
                                            <div className="certificate-icon">
                                                <StarIcon size={32} color="#b4690e" />
                                            </div>
                                            <div className="certificate-info">
                                                <h3>{cert.courseTitle}</h3>
                                                <p>Completed on {new Date(cert.issuedAt).toLocaleDateString()}</p>
                                            </div>
                                        </Link>
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