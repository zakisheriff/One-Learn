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
            const courseRes = await axios.get(`/api/courses/${slug}`);
            const courseId = courseRes.data.course.id;
            setCourse(courseRes.data.course);

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
            const response = await axios.get(`/api/certificates/${course.id}/download?t=${Date.now()}`, {
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
                            <div className="cert-frame">
                                <div className="cert-inner-border">
                                    <div className="cert-content">
                                        <div className="cert-header">CERTIFICATE OF COMPLETION</div>

                                        <div className="cert-recipient">{certificate.recipientName}</div>
                                        <div className="cert-gold-line"></div>

                                        <div className="cert-text">HAS SUCCESSFULLY COMPLETED</div>

                                        <div className="cert-course-title">{certificate.courseTitle}</div>

                                        <div className="cert-footer">
                                            <div className="cert-footer-item">
                                                <div className="cert-footer-text">
                                                    {new Date(certificate.completionDate).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    }).toUpperCase()}
                                                </div>
                                                <div className="cert-footer-line"></div>
                                                <div className="cert-footer-label">DATE</div>
                                            </div>

                                            <div className="cert-seal">
                                                <div className="seal-circle">
                                                    <span>VERIFIED</span>
                                                </div>
                                            </div>

                                            <div className="cert-footer-item">
                                                <div className="cert-footer-text signature">You Learn</div>
                                                <div className="cert-footer-line"></div>
                                                <div className="cert-footer-label">SIGNATURE</div>
                                            </div>
                                        </div>

                                        <div className="cert-id">
                                            ID: {certificate.verificationHash}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="certificate-actions">
                            <h2>Share Your Achievement</h2>

                            <div className="action-buttons">
                                <button onClick={handleDownload} className="action-btn download-btn">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                                    </svg>
                                    Download Certificate
                                </button>

                                <button onClick={shareToLinkedIn} className="action-btn linkedin-btn">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                    Share on LinkedIn
                                </button>
                            </div>

                            <div className="verification-info">
                                <h3>Verification</h3>
                                <p>Verify this certificate at:</p>
                                <a href={certificate.verificationUrl} target="_blank" rel="noopener noreferrer" className="verification-link">
                                    {certificate.verificationUrl}
                                </a>
                            </div>

                            <div className="linkedin-manual-instructions">
                                <h3>Add to LinkedIn</h3>
                                <p>Manual steps:</p>
                                <ol>
                                    <li>Go to <strong>Licenses & certifications</strong></li>
                                    <li>Click <strong>+</strong> to add new</li>
                                    <li><strong>Name:</strong> {certificate.courseTitle}</li>
                                    <li><strong>Organization:</strong> You Learn</li>
                                    <li><strong>Date:</strong> {new Date(certificate.completionDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</li>
                                    <li><strong>ID:</strong> {certificate.verificationHash}</li>
                                    <li><strong>URL:</strong> {certificate.verificationUrl}</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CertificatePage;