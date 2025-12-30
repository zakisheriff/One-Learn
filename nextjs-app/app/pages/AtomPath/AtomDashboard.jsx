import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../App';
import { CodeIcon, ChartBarIcon, RocketIcon, LockIcon, CheckIcon } from '../../components/Icons';
import '../../styles/AtomDashboard.css';

const AtomDashboard = () => {
    const { user } = useContext(AuthContext);
    const [tracks, setTracks] = useState([]);
    const [stats, setStats] = useState({ xp: 0, badges: 0, certificates: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tracksRes, statsRes] = await Promise.all([
                axios.get('/api/atom/tracks'),
                axios.get('/api/atom/stats')
            ]);

            setTracks(tracksRes.data.tracks);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIconForTrack = (slug) => {
        if (slug.includes('python')) return <CodeIcon size={32} color="#306998" />;
        if (slug.includes('data')) return <ChartBarIcon size={32} color="#F4A460" />;
        if (slug.includes('sql')) return <RocketIcon size={32} color="#00758F" />;
        return <CodeIcon size={32} />;
    };

    return (
        <div className="atom-dashboard">
            <div className="atom-hero">
                <div className="atom-hero-content">
                    <h1>Atom Path</h1>
                    <p>Master coding skills through our structured, rigorous certification paths.</p>

                    <div className="atom-stats-bar">
                        <div className="stat-item">
                            <span className="stat-value">{stats.xp}</span>
                            <span className="stat-label">Total XP</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-value">{stats.badges}</span>
                            <span className="stat-label">Badges</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-value">{stats.certificates}</span>
                            <span className="stat-label">Certificates</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="atom-container">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading tracks...</p>
                    </div>
                ) : (
                    <div className="tracks-grid">
                        {tracks.map(track => (
                            <Link to={`/atom-path/${track.slug}`} key={track.id} className="track-card">
                                <div className="track-icon">
                                    {getIconForTrack(track.slug)}
                                </div>
                                <div className="track-info">
                                    <h3>{track.title}</h3>
                                    <p>{track.description}</p>
                                    <div className="track-meta">
                                        <span>{track.module_count} Modules</span>
                                        <span>•</span>
                                        <span>Certification</span>
                                    </div>
                                </div>
                                <div className="track-status">
                                    <span className="status-badge">Start Path</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AtomDashboard;
