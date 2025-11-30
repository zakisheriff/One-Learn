import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/VerifyPage.css';

const VerifyPage = () => {
    const [searchParams] = useSearchParams();
    const verificationId = searchParams.get('id');
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (verificationId) {
            verifyCertificate();
        } else {
            setError('No verification ID provided');
            setLoading(false);
        }
    }, [verificationId]);

    const verifyCertificate = async () => {
        try {
            const response = await axios.get(`/api/verify?id=${verificationId}`);
            setCertificate(response.data.certificate);
        } catch (err) {
            setError(err.response?.data?.message || 'Certificate not found');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="verify-page">

            <main className="verify-main">
                <div className="container">
                    {loading && (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Verifying certificate...</p>
                        </div>
                    )}

                    {error && (
                        <div className="verify-error">
                            <div className="error-icon">❌</div>
                            <h1>Certificate Not Found</h1>
                            <p>{error}</p>
                            <p className="error-hint">
                                This verification ID does not match any certificate in our system.
                                Please check the ID and try again.
                            </p>
                            <Link to="/" className="home-link">← Back to Home</Link>
                        </div>
                    )}

                    {certificate && (
                        <div className="verify-success">
                            <div className="success-icon">✓</div>
                            <h1>Certificate Verified</h1>
                            <p className="verify-subtitle">This is a valid certificate issued by You Learn</p>

                            <div className="certificate-details">
                                <div className="detail-row">
                                    <span className="detail-label">Recipient</span>
                                    <span className="detail-value">{certificate.recipientName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Course</span>
                                    <span className="detail-value">{certificate.courseTitle}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Completion Date</span>
                                    <span className="detail-value">
                                        {new Date(certificate.completionDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Issued By</span>
                                    <span className="detail-value">{certificate.organization}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Issued On</span>
                                    <span className="detail-value">
                                        {new Date(certificate.issuedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>

                            <div className="verification-badge">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                <span>Verified Authentic</span>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default VerifyPage;
