import React from 'react';
import '../styles/HelpCenter.css';

const HelpCenter = () => {
    return (
        <div className="help-center-page">
            <main className="help-main">
                <div className="help-hero">
                    <h1>How can we help you?</h1>
                    <div className="help-search">
                        <input type="text" placeholder="Search for help..." />
                        <button>Search</button>
                    </div>
                </div>

                <div className="help-container">
                    <section className="help-categories">
                        <h2>Browse by Topic</h2>
                        <div className="categories-grid">
                            <div className="category-card">
                                <h3>Getting Started</h3>
                                <p>Learn how to create an account and start learning.</p>
                            </div>
                            <div className="category-card">
                                <h3>Account & Profile</h3>
                                <p>Manage your account settings and profile information.</p>
                            </div>
                            <div className="category-card">
                                <h3>Courses & Content</h3>
                                <p>Find courses, track progress, and access materials.</p>
                            </div>
                            <div className="category-card">
                                <h3>Certificates</h3>
                                <p>Earn, view, and share your certificates of completion.</p>
                            </div>
                            <div className="category-card">
                                <h3>Technical Support</h3>
                                <p>Troubleshoot common issues and technical problems.</p>
                            </div>
                            <div className="category-card">
                                <h3>Billing & Payments</h3>
                                <p>Understand pricing, subscriptions, and payment methods.</p>
                            </div>
                        </div>
                    </section>

                    <section className="faq-section">
                        <h2>Frequently Asked Questions</h2>
                        <div className="faq-list">
                            <div className="faq-item">
                                <h3>Is You Learn free?</h3>
                                <p>Yes, You Learn is completely free to use. We believe in accessible education for everyone.</p>
                            </div>
                            <div className="faq-item">
                                <h3>How do I earn a certificate?</h3>
                                <p>Complete all lessons in a course and pass the final quiz with a score of 80% or higher to earn a certificate.</p>
                            </div>
                            <div className="faq-item">
                                <h3>Can I share my certificates on LinkedIn?</h3>
                                <p>Yes! Once you earn a certificate, you can easily share it to your LinkedIn profile directly from the certificate page.</p>
                            </div>
                        </div>
                    </section>

                    <section className="contact-section">
                        <h2>Still need help?</h2>
                        <p>Our support team is here to assist you.</p>
                        <button className="contact-button">Contact Support</button>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default HelpCenter;
