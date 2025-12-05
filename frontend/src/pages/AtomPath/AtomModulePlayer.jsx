import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { ChevronLeftIcon, CheckIcon } from '../../components/Icons';
import '../../styles/AtomModulePlayer.css';

// Placeholder components for engines (will be implemented next)
const ReadingEngine = ({ content, onComplete }) => (
    <div className="atom-reading-content">
        <ReactMarkdown>{content.content_markdown}</ReactMarkdown>
        <button className="atom-btn-primary" onClick={onComplete}>Mark as Read</button>
    </div>
);

import QuizEngine from '../../components/Atom/QuizEngine';
import CodingEngine from '../../components/Atom/CodingEngine';
import InterviewEngine from '../../components/Atom/InterviewEngine';

const AtomModulePlayer = () => {
    const { moduleId } = useParams();
    const navigate = useNavigate();
    const [module, setModule] = useState(null);
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchModuleContent();
    }, [moduleId]);

    const fetchModuleContent = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/atom/modules/${moduleId}`);
            setModule(response.data.module);
            setContent(response.data.content);
        } catch (err) {
            setError('Failed to load module content');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleModuleComplete = async () => {
        try {
            await axios.post(`/api/atom/modules/${moduleId}/complete`, { score: 100 });
            // Optional: Show success animation or toast here
            navigate(-1);
        } catch (error) {
            console.error('Failed to complete module:', error);
            alert('Failed to save progress. Please try again.');
        }
    };

    if (loading) return <div className="atom-loading">Loading module...</div>;
    if (error) return <div className="atom-error">{error}</div>;
    if (!module) return <div className="atom-error">Module not found</div>;

    return (
        <div className="atom-player">
            <header className="atom-player-header">
                <button onClick={() => navigate(-1)} className="atom-back-btn">
                    <ChevronLeftIcon /> Back
                </button>
                <div className="atom-header-info">
                    <span className="atom-type-badge">{module.type.toUpperCase()}</span>
                    <h1>{module.title}</h1>
                </div>
                <div className="atom-header-actions">
                    {/* Progress or Timer will go here */}
                </div>
            </header>

            <main className="atom-player-content">
                {module.type === 'reading' && (
                    <ReadingEngine content={content} onComplete={handleModuleComplete} />
                )}
                {module.type === 'coding' && (
                    <CodingEngine content={content} onComplete={handleModuleComplete} />
                )}
                {module.type === 'quiz' && (
                    <QuizEngine content={content} onComplete={handleModuleComplete} />
                )}
                {module.type === 'interview' && (
                    <InterviewEngine content={content} onComplete={handleModuleComplete} />
                )}
            </main>
        </div>
    );
};

export default AtomModulePlayer;
