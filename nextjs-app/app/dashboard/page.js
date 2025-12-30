'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Dashboard.css';

export default function DashboardPage() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchEnrollments();
        } else {
            window.location.href = '/login';
        }
    }, [user]);

    const fetchEnrollments = async () => {
        try {
            const response = await axios.get('/api/enrollments');
            setEnrollments(response.data.enrollments || []);
        } catch (error) {
            console.error('Failed to fetch enrollments:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    if (loading) {
        return (
            <div className="dashboard-page" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <main className="container" style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div className="page-header" style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>My Dashboard</h1>
                    <p style={{ fontSize: '1.25rem', color: '#86868b' }}>
                        Welcome back, {user.fullName || user.email}!
                    </p>
                </div>

                <div className="enrollments-section">
                    <h2 style={{ marginBottom: '2rem' }}>My Courses</h2>
                    {enrollments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px' }}>
                            <h3>No courses yet</h3>
                            <p style={{ color: '#86868b', margin: '1rem 0 2rem' }}>
                                Start learning by enrolling in a course
                            </p>
                            <Link href="/explore" className="btn-primary">
                                Explore Courses
                            </Link>
                        </div>
                    ) : (
                        <div className="courses-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                            {enrollments.map((enrollment) => (
                                <Link
                                    key={enrollment.id}
                                    href={`/course/${enrollment.course.slug}`}
                                    className="course-card"
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '16px',
                                        padding: '1.5rem',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    {enrollment.course.thumbnailUrl && (
                                        <img
                                            src={enrollment.course.thumbnailUrl}
                                            alt={enrollment.course.title}
                                            style={{ width: '100%', borderRadius: '12px', marginBottom: '1rem' }}
                                        />
                                    )}
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{enrollment.course.title}</h3>
                                    <p style={{ color: '#86868b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                                        {enrollment.course.description?.slice(0, 100)}...
                                    </p>
                                    <div style={{ marginTop: 'auto' }}>
                                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', height: '8px', overflow: 'hidden' }}>
                                            <div
                                                style={{
                                                    background: 'linear-gradient(90deg, #0071e3, #00c6ff)',
                                                    height: '100%',
                                                    width: `${enrollment.progress || 0}%`,
                                                    transition: 'width 0.3s ease',
                                                }}
                                            />
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: '#86868b', marginTop: '0.5rem' }}>
                                            {enrollment.progress || 0}% complete
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
