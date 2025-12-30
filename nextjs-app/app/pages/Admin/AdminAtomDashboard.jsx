import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PlusIcon, EditIcon, TrashIcon } from '../../components/Icons';
import '../../styles/AdminAtomDashboard.css';

const AdminAtomDashboard = () => {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTracks();
    }, []);

    const fetchTracks = async () => {
        try {
            const response = await axios.get('/api/atom/tracks');
            setTracks(response.data.tracks);
        } catch (error) {
            console.error('Failed to fetch tracks:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-atom-dashboard">
            <header className="admin-header">
                <h1>Atom Path Management</h1>
                <button className="atom-btn-primary">
                    <PlusIcon size={16} /> New Track
                </button>
            </header>

            <div className="admin-content">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Slug</th>
                                <th>Difficulty</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tracks.map(track => (
                                <tr key={track.id}>
                                    <td>{track.title}</td>
                                    <td>{track.slug}</td>
                                    <td>
                                        <span className={`badge ${track.difficulty}`}>
                                            {track.difficulty}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-dot ${track.is_published ? 'published' : 'draft'}`}></span>
                                        {track.is_published ? 'Published' : 'Draft'}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <Link to={`/admin/atom/tracks/${track.id}`} className="icon-btn">
                                                <EditIcon size={16} />
                                            </Link>
                                            <button className="icon-btn delete">
                                                <TrashIcon size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AdminAtomDashboard;
