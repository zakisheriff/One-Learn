import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../styles/CertificatePage.css';

const CertificatePage = () => {
    const { slug } = useParams();
    const [certificate, setCertificate] = useState(null);
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCertificate();
    }, [slug]);

    const fetchCertificate = async () => {
        try {
            // Get course ID from slug
            const courseRes = await axios.get(`/api/courses/${slug}`);
            const courseId = courseRes.data.course.id;
            setCourse(courseRes.data.course);

            // Get certificate
            const certRes = await axios.get(`/api/certificates/${courseId}`);
            setCertificate(certRes.data.certificate);
        } catch (err) {
            console.error('Failed to load certificate:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const response = await axios.get(`/api/certificates/${course.id}/download`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${certificate.recipientName}_Certificate.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Failed to download certificate');
        }
    };

    const shareToLinkedIn = () => {
        const url = encodeURIComponent(certificate.verificationUrl);
        const title = encodeURIComponent(`I completed ${certificate.courseTitle} on You Learn!`);
        const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        window.open(linkedInUrl, '_blank');
    };

    if (loading) {
        return (
            <div className="certificate-page">
                <Navbar />
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading certificate...</p>
                </div>
            </div>
        );
    }

    if (!certificate) {
        return (
            <div className="certificate-page">
                <Navbar />
                <div className="error-state">
                    <p>Certificate not found. Complete the course quiz to earn your certificate.</p>
                    <Link to="/dashboard">← Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="certificate-page">
            <Navbar />

            <main className="certificate-main">
                <div className="container">
                    <div className="certificate-container">
                        <div className="certificate-preview">
                            <div className="cert-border">
                                <div className="cert-content">
                                    <h1 className="cert-title">Certificate of Completion</h1>
                                    <div className="cert-divider"></div>

                                    <p className="cert-label">This is to certify that</p>
                                    <h2 className="cert-name">{certificate.recipientName}</h2>

                                    <p className="cert-label">has successfully completed</p>
                                    <h3 className="cert-course">{certificate.courseTitle}</h3>

                                    <p className="cert-org">Issued by You Learn</p>
                                    <p className="cert-date">
                                        Date of Completion: {new Date(certificate.completionDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>

                                    <div className="cert-verification">
                                        <p>Verification ID:</p>
                                        <code>{certificate.verificationHash}</code>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="certificate-actions">
                            <h2>Share Your Achievement</h2>

                            <div className="action-buttons">
                                <button onClick={handleDownload} className="action-btn download-btn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                    </svg>
                                    Download Certificate
                                </button>

                                <button onClick={shareToLinkedIn} className="action-btn linkedin-btn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                    Share on LinkedIn
                                </button>
                            </div>

                            <div className="verification-info">
                                <h3>Verification</h3>
                                <p>Anyone can verify this certificate at:</p>
                                <a href={certificate.verificationUrl} target="_blank" rel="noopener noreferrer" className="verification-link">
                                    {certificate.verificationUrl}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CertificatePage;
