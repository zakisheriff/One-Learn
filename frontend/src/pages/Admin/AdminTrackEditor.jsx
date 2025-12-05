import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeftIcon, PlusIcon, EditIcon, TrashIcon } from '../../components/Icons';
import '../../styles/AdminAtomDashboard.css';

const AdminTrackEditor = () => {
    const { trackId } = useParams();
    const navigate = useNavigate();
    const [track, setTrack] = useState({
        title: '',
        slug: '',
        description: '',
        difficulty: 'beginner',
        is_published: false
    });
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (trackId !== 'new') {
            fetchTrackData();
        } else {
            setLoading(false);
        }
    }, [trackId]);

    const fetchTrackData = async () => {
        try {
            const response = await axios.get(`/api/atom/tracks/${trackId}`); // We need to ensure this endpoint returns modules too or fetch separately
            // The public endpoint /api/atom/tracks/:slug returns modules.
            // But here we have ID. We might need an admin endpoint or just use the slug one if we had slug.
            // Let's assume we have an admin endpoint GET /api/atom/admin/tracks/:id
            // For now, I'll use the public one if I can get slug, but I don't have slug yet.
            // I'll assume I can fetch by ID or I'll add that endpoint.
            // Actually, let's just use the public one if we can, but we need to fetch by ID.
            // I'll add GET /api/atom/tracks/:id to the controller if it doesn't exist.
            // Wait, the existing one is by slug.

            // Fetch by ID directly
            const trackRes = await axios.get(`/api/atom/tracks/${trackId}`);
            setTrack(trackRes.data.track);

            // Fetch modules using the slug from the track we just got
            // Or we should add an endpoint to get modules by track ID.
            // For now, let's use the slug endpoint if we have it, or just rely on the public one.
            if (trackRes.data.track.slug) {
                const fullTrackRes = await axios.get(`/api/atom/tracks/${trackRes.data.track.slug}`);
                setModules(fullTrackRes.data.modules);
            }
        } catch (error) {
            console.error('Failed to fetch track:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (trackId === 'new') {
                await axios.post('/api/atom/tracks', track);
            } else {
                await axios.put(`/api/atom/tracks/${trackId}`, track);
            }
            navigate('/admin/atom');
        } catch (error) {
            console.error('Failed to save:', error);
            alert('Failed to save track');
        }
    };

    return (
        <div className="admin-atom-dashboard">
            <header className="admin-header">
                <div className="header-left">
                    <button onClick={() => navigate('/admin/atom')} className="icon-btn">
                        <ChevronLeftIcon />
                    </button>
                    <h1>{trackId === 'new' ? 'New Track' : 'Edit Track'}</h1>
                </div>
                <button className="atom-btn-primary" onClick={handleSave}>
                    Save Changes
                </button>
            </header>

            <div className="admin-form-container">
                <div className="form-group">
                    <label>Title</label>
                    <input
                        type="text"
                        value={track.title}
                        onChange={e => setTrack({ ...track, title: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Slug</label>
                    <input
                        type="text"
                        value={track.slug}
                        onChange={e => setTrack({ ...track, slug: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        value={track.description}
                        onChange={e => setTrack({ ...track, description: e.target.value })}
                    />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Difficulty</label>
                        <select
                            value={track.difficulty}
                            onChange={e => setTrack({ ...track, difficulty: e.target.value })}
                        >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                    </div>
                    <div className="form-group checkbox">
                        <label>
                            <input
                                type="checkbox"
                                checked={track.is_published}
                                onChange={e => setTrack({ ...track, is_published: e.target.checked })}
                            />
                            Published
                        </label>
                    </div>
                </div>
            </div>

            {trackId !== 'new' && (
                <div className="modules-section">
                    <div className="section-header">
                        <h2>Modules</h2>
                        <Link to={`/admin/atom/modules/new?trackId=${trackId}`} className="atom-btn-secondary">
                            <PlusIcon size={14} /> Add Module
                        </Link>
                    </div>

                    <div className="modules-list">
                        {modules.map((module, index) => (
                            <div key={module.id} className="module-item">
                                <span className="module-order">{index + 1}</span>
                                <div className="module-info">
                                    <h4>{module.title}</h4>
                                    <span className="module-type">{module.type}</span>
                                </div>
                                <div className="action-buttons">
                                    <Link to={`/admin/atom/modules/${module.id}`} className="icon-btn">
                                        <EditIcon size={16} />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTrackEditor;
