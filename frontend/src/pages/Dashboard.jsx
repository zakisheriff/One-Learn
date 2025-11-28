import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import Navbar from '../components/Navbar';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [enrollments, setEnrollments] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

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

                    <section className="dashboard-section">
                        <h2>My Courses</h2>

                        {enrollments.length === 0 ? (
                            <div className="empty-state">
                                <p>You haven't enrolled in any courses yet.</p>
                                <Link to="/" className="browse-link">Browse Courses</Link>
                            </div>
                        ) : (
                            <div className="enrollments-grid">
                                {enrollments.map(enrollment => (
                                    <div key={enrollment.id} className="enrollment-card">
                                        {enrollment.course.thumbnailUrl && (
                                            <div className="enrollment-thumbnail">
                                                <img src={enrollment.course.thumbnailUrl} alt={enrollment.course.title} />
                                                <div className="progress-overlay">
                                                    <div className="progress-bar">
                                                        <div
                                                            className="progress-fill"
                                                            style={{ width: `${enrollment.progress}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="progress-text">{enrollment.progress}% Complete</span>
                                                </div>
                                            </div>
                                        )}
                                        <div className="enrollment-content">
                                            <h3>{enrollment.course.title}</h3>
                                            <p>{enrollment.course.description}</p>
                                            <Link
                                                to={`/course/${enrollment.course.slug}/learn`}
                                                className="continue-button"
                                            >
                                                {enrollment.progress === 0 ? 'Start Learning' : 'Continue Learning'}
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {certificates.length > 0 && (
                        <section className="dashboard-section">
                            <h2>My Certificates</h2>
                            <div className="certificates-grid">
                                {certificates.map(cert => (
                                    <div key={cert.id} className="certificate-card">
                                        <div className="certificate-icon">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 15l-2 5l-4-2l-2 4V4a2 2 0 012-2h12a2 2 0 012 2v18l-2-4l-4 2l-2-5z" />
                                            </svg>
                                        </div>
                                        <h3>{cert.courseTitle}</h3>
                                        <p>Completed on {new Date(cert.completionDate).toLocaleDateString()}</p>
                                        <Link
                                            to={`/course/${cert.courseSlug}/certificate`}
                                            className="view-cert-button"
                                        >
                                            View Certificate
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
