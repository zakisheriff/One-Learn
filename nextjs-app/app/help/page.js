'use client';

import React from 'react';
import Link from 'next/link';
import '../styles/HelpCenter.css';

export default function HelpPage() {
    return (
        <div className="help-page">
            <main className="container" style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
                <div className="page-header" style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Help Center</h1>
                    <p style={{ fontSize: '1.25rem', color: '#86868b' }}>
                        How can we help you today?
                    </p>
                </div>

                <div className="help-sections">
                    <section style={{ marginBottom: '3rem', padding: '2rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Getting Started</h2>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '1rem' }}>
                                <strong>How do I enroll in a course?</strong>
                                <p style={{ color: '#86868b', marginTop: '0.5rem' }}>
                                    Browse courses on the Explore page and click "Enroll" on any course you're interested in.
                                </p>
                            </li>
                            <li style={{ marginBottom: '1rem' }}>
                                <strong>How do I track my progress?</strong>
                                <p style={{ color: '#86868b', marginTop: '0.5rem' }}>
                                    Visit your Dashboard to see all enrolled courses and your progress in each.
                                </p>
                            </li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '3rem', padding: '2rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Certificates</h2>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '1rem' }}>
                                <strong>How do I earn a certificate?</strong>
                                <p style={{ color: '#86868b', marginTop: '0.5rem' }}>
                                    Complete all lessons in a course and pass the final quiz with a score of 70% or higher.
                                </p>
                            </li>
                            <li style={{ marginBottom: '1rem' }}>
                                <strong>Where can I find my certificates?</strong>
                                <p style={{ color: '#86868b', marginTop: '0.5rem' }}>
                                    All earned certificates are available in your Dashboard under the Certificates tab.
                                </p>
                            </li>
                        </ul>
                    </section>

                    <section style={{ padding: '2rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Need More Help?</h2>
                        <p style={{ color: '#86868b', marginBottom: '2rem' }}>
                            Can't find what you're looking for? Reach out to our support team.
                        </p>
                        <Link href="mailto:support@onelearn.com" className="btn-primary">
                            Contact Support
                        </Link>
                    </section>
                </div>
            </main>
        </div>
    );
}
