import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeftIcon } from '../../components/Icons';
import '../../styles/AdminAtomDashboard.css';

const AdminModuleEditor = () => {
    const { moduleId } = useParams();
    const navigate = useNavigate();
    const [module, setModule] = useState({
        title: '',
        type: 'reading',
        order_index: 1,
        xp_reward: 50
    });
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (moduleId !== 'new') {
            fetchModuleData();
        } else {
            setLoading(false);
        }
    }, [moduleId]);

    const fetchModuleData = async () => {
        try {
            const response = await axios.get(`/api/atom/modules/${moduleId}`);
            setModule(response.data.module);
            setContent(response.data.content);
        } catch (error) {
            console.error('Failed to fetch module:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            // We need track_id for creation. 
            // Ideally it should be passed in state or query param if new.
            // For now, let's assume we are editing or we have a way to get it.
            // Actually, the route is /admin/atom/modules/:moduleId. 
            // If new, we don't know the track ID unless passed.
            // Let's assume we pass it in query string ?trackId=... for new modules.

            const params = new URLSearchParams(window.location.search);
            const trackIdParam = params.get('trackId');

            if (moduleId === 'new') {
                if (!trackIdParam) {
                    alert('Missing Track ID');
                    return;
                }
                await axios.post('/api/atom/modules', { ...module, track_id: trackIdParam, ...content });
            } else {
                await axios.put(`/api/atom/modules/${moduleId}`, { ...module, ...content });
            }
            navigate(-1);
        } catch (error) {
            console.error('Failed to save module:', error);
            alert('Failed to save module');
        }
    };

    return (
        <div className="admin-atom-dashboard">
            <header className="admin-header">
                <div className="header-left">
                    <button onClick={() => navigate(-1)} className="icon-btn">
                        <ChevronLeftIcon />
                    </button>
                    <h1>{moduleId === 'new' ? 'New Module' : 'Edit Module'}</h1>
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
                        value={module.title}
                        onChange={e => setModule({ ...module, title: e.target.value })}
                    />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Type</label>
                        <select
                            value={module.type}
                            onChange={e => setModule({ ...module, type: e.target.value })}
                            disabled={moduleId !== 'new'}
                        >
                            <option value="reading">Reading</option>
                            <option value="coding">Coding</option>
                            <option value="quiz">Quiz</option>
                            <option value="interview">Interview</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>XP Reward</label>
                        <input
                            type="number"
                            value={module.xp_reward}
                            onChange={e => setModule({ ...module, xp_reward: parseInt(e.target.value) })}
                        />
                    </div>
                </div>

                {/* Content Editors based on Type */}
                {module.type === 'reading' && (
                    <div className="form-group">
                        <label>Markdown Content</label>
                        <textarea
                            value={content.content_markdown || ''}
                            onChange={e => setContent({ ...content, content_markdown: e.target.value })}
                            style={{ minHeight: '300px', fontFamily: 'monospace' }}
                        />
                    </div>
                )}

                {module.type === 'coding' && (
                    <>
                        <div className="form-group">
                            <label>Problem Description (Markdown)</label>
                            <textarea
                                value={content.description_markdown || ''}
                                onChange={e => setContent({ ...content, description_markdown: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Starter Code</label>
                            <textarea
                                value={content.starter_code || ''}
                                onChange={e => setContent({ ...content, starter_code: e.target.value })}
                                style={{ fontFamily: 'monospace' }}
                            />
                        </div>
                    </>
                )}

                {/* Add other types as needed */}
            </div>
        </div>
    );
};

export default AdminModuleEditor;
