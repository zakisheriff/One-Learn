'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/AtomTrackDetails.css';

export default function AtomPathPage() {
    const { user } = useAuth();
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTracks();
    }, []);

    const fetchTracks = async () => {
        try {
            const response = await axios.get('/api/atom/tracks');
            setTracks(response.data.tracks || []);
        } catch (error) {
            console.error('Failed to fetch atom tracks:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen text="Loading Atom Paths..." />;
    }

    return (
        <div className="atom-page">
            <main className="container" style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
                <div className="page-header" style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Atom Learning Paths</h1>
                    <p style={{ fontSize: '1.25rem', color: '#86868b' }}>
                        Interactive, hands-on learning experiences with coding challenges, interviews, and quizzes
                    </p>
                </div>

                {tracks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <h3>No Atom Paths Available</h3>
                        <p style={{ color: '#86868b', marginTop: '1rem' }}>
                            Check back soon for new interactive learning paths!
                        </p>
                    </div>
                ) : (
                    <div className="tracks-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {tracks.map((track) => (
                            <Link
                                key={track.id}
                                href={`/atom-path/${track.id}`}
                                className="track-card"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '16px',
                                    padding: '2rem',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                {track.thumbnailUrl && (
                                    <img
                                        src={track.thumbnailUrl}
                                        alt={track.title}
                                        style={{ width: '100%', borderRadius: '12px', marginBottom: '1rem' }}
                                    />
                                )}
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{track.title}</h3>
                                <p style={{ color: '#86868b', marginBottom: '1rem' }}>{track.description}</p>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#0a66c2' }}>
                                    <span>{track.difficulty}</span>
                                    <span>•</span>
                                    <span>{track.estimatedHours}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
