import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../App';
import { ChevronLeftIcon, CheckIcon, LockIcon, PlayIcon, CodeIcon, RocketIcon, ChartBarIcon, BookIcon, HelpCircleIcon, MicIcon, FileTextIcon } from '../../components/Icons';
import '../../styles/AtomTrackDetails.css';

const AtomTrackDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [track, setTrack] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrackData();
    }, [slug]);

    const fetchTrackData = async () => {
        try {
            const response = await axios.get(`/api/atom/tracks/${slug}`);
            setTrack(response.data.track);
            setModules(response.data.modules);
        } catch (error) {
            console.error('Failed to fetch track:', error);
            // navigate('/atom-path'); // Redirect on error? Maybe show error state instead.
        } finally {
            setLoading(false);
        }
    };

    const getIconForTrack = (slug) => {
        if (!slug) return <CodeIcon size={48} />;
        if (slug.includes('python')) return <CodeIcon size={48} color="#306998" />;
        if (slug.includes('data')) return <ChartBarIcon size={48} color="#F4A460" />;
        if (slug.includes('sql')) return <RocketIcon size={48} color="#00758F" />;
        return <CodeIcon size={48} />;
    };

    const getModuleIcon = (type) => {
        switch (type) {
            case 'reading': return <BookIcon size={24} color="#60a5fa" />;
            case 'coding': return <CodeIcon size={24} color="#34d399" />;
            case 'quiz': return <HelpCircleIcon size={24} color="#f472b6" />;
            case 'interview': return <MicIcon size={24} color="#a78bfa" />;
            default: return <FileTextIcon size={24} color="#9ca3af" />;
        }
    };

    if (loading) {
        return (
            <div className="atom-loading">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!track) {
        return (
            <div className="atom-error">
                <h2>Track not found</h2>
                <Link to="/atom-path" className="atom-btn-secondary">Back to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="atom-track-details">
            <div className="track-header">
                <div className="header-content">
                    <Link to="/atom-path" className="back-link">
                        <ChevronLeftIcon size={16} /> Back to Paths
                    </Link>
                    <div className="track-title-section">
                        <div className="track-large-icon">
                            {getIconForTrack(track.slug)}
                        </div>
                        <div>
                            <h1>{track.title}</h1>
                            <p>{track.description}</p>
                            <div className="track-badges">
                                <span className={`difficulty-badge ${track.difficulty}`}>{track.difficulty}</span>
                                <span className="xp-badge">{modules.reduce((acc, m) => acc + m.xp_reward, 0)} XP Total</span>
                            </div>
                            {track.certificate_id && (
                                <a
                                    href={`${import.meta.env.VITE_API_URL || ''}/api/atom/certificates/${track.certificate_id}/download`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="atom-btn-primary"
                                    style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                >
                                Download Certificate
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="track-content-container">
                <div className="modules-timeline">
                    {modules.map((module, index) => (
                        <div key={module.id} className="timeline-item">
                            <div className="timeline-connector">
                                <div className="timeline-dot"></div>
                                {index !== modules.length - 1 && <div className="timeline-line"></div>}
                            </div>
                            <Link to={`/atom-path/learn/${module.id}`} className="module-card-row">
                                <div className="module-icon-wrapper">
                                    {getModuleIcon(module.type)}
                                </div>
                                <div className="module-info-row">
                                    <h3>{module.title}</h3>
                                    <span className="module-meta">{module.type.charAt(0).toUpperCase() + module.type.slice(1)} • {module.xp_reward} XP</span>
                                </div>
                                <div className="module-action">
                                    <PlayIcon size={20} />
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AtomTrackDetails;
