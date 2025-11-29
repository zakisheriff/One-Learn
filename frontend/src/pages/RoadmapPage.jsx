import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { AuthContext } from '../App';
import { LanguageContext } from '../context/LanguageContext';
import { StarIcon, BookIcon, CheckIcon, TargetIcon, ArrowRightIcon, SearchIcon } from '../components/Icons';
import '../styles/RoadmapPage.css';

const RoadmapPage = () => {
    const { user } = useContext(AuthContext);
    const { t } = useContext(LanguageContext);
    const navigate = useNavigate();

    const [goal, setGoal] = useState('');
    const [loading, setLoading] = useState(false);
    const [roadmap, setRoadmap] = useState(null);
    const [error, setError] = useState('');

    const popularRoles = [
        'Software Engineer',
        'Data Scientist',
        'Product Manager',
        'UX Designer',
        'Digital Marketer',
        'Cybersecurity Analyst'
    ];

    const { id } = useParams();

    useEffect(() => {
        if (id) {
            fetchSavedRoadmap(id);
        }
    }, [id]);

    const fetchSavedRoadmap = async (roadmapId) => {
        setLoading(true);
        try {
            // We need an endpoint to get a single roadmap, or filter from user roadmaps
            // Since we don't have a specific single-get endpoint yet, let's use the list and find it
            // Ideally we should make a new endpoint, but for speed let's reuse the list if possible
            // Actually, let's add a proper endpoint or just use the list for now.
            // Wait, the user might be viewing a public roadmap? No, it's saved to profile.
            // Let's assume we can fetch it.
            const response = await axios.get('/api/roadmaps');
            const found = response.data.roadmaps.find(r => r.id === roadmapId);
            if (found) {
                setRoadmap(found.content); // Content stores the full roadmap object
            } else {
                setError('Roadmap not found.');
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load roadmap.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (selectedGoal) => {
        const targetGoal = selectedGoal || goal;
        if (!targetGoal.trim()) return;

        setLoading(true);
        setError('');
        setRoadmap(null);

        try {
            const response = await axios.post('/api/roadmaps/generate', { goal: targetGoal });
            setRoadmap(response.data.roadmap);
        } catch (err) {
            console.error(err);
            setError('Failed to generate roadmap. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            await axios.post('/api/roadmaps/save', {
                title: roadmap.title,
                content: roadmap
            });
            // Navigate to dashboard to see saved roadmap
            navigate('/dashboard?tab=saved');
        } catch (err) {
            console.error(err);
            alert('Failed to save roadmap.');
        }
    };

    return (
        <div className="roadmap-page">
            <Navbar />

            <main className="roadmap-container">
                <div className="roadmap-hero">
                    <div className="hero-badge">
                        <StarIcon size={14} color="#0071e3" filled /> AI-Powered Learning Paths
                    </div>
                    <h1>Design Your Future Career</h1>
                    <p>Tell us your dream role, and our AI will build a personalized, step-by-step roadmap just for you.</p>

                    {!roadmap && (
                        <div className="roadmap-input-section">
                            <div className="input-wrapper">
                                <div className="search-icon-wrapper">
                                    <SearchIcon size={20} color="#86868b" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="What do you want to become? (e.g. Senior React Developer)"
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                />
                                <button
                                    className="generate-btn"
                                    onClick={() => handleGenerate()}
                                    disabled={loading || !goal.trim()}
                                >
                                    {loading ? (
                                        <span className="loading-dots">Generating<span>.</span><span>.</span><span>.</span></span>
                                    ) : (
                                        <>
                                            Generate Path <ArrowRightIcon size={16} color="white" />
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="popular-tags">
                                <span>Trending Roles:</span>
                                {popularRoles.map(role => (
                                    <button
                                        key={role}
                                        className="tag-pill"
                                        onClick={() => {
                                            setGoal(role);
                                            handleGenerate(role);
                                        }}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="loading-state">
                        <div className="spinner-ring"></div>
                        <h3>Analyzing Industry Trends...</h3>
                        <p>Our AI is curating the best resources for your path.</p>
                    </div>
                )}

                {error && <div className="error-message">{error}</div>}

                {roadmap && (
                    <div className="roadmap-result">
                        <div className="result-header">
                            <div className="header-content">
                                <div className="header-icon">
                                    <TargetIcon size={40} color="#0071e3" />
                                </div>
                                <div>
                                    <h2>{roadmap.title}</h2>
                                    <p>{roadmap.description}</p>
                                </div>
                            </div>
                            <div className="result-actions">
                                <button className="secondary-btn" onClick={() => setRoadmap(null)}>New Search</button>
                                <button className="primary-btn" onClick={handleSave}>
                                    {user ? 'Save to Profile' : 'Login to Save'}
                                </button>
                            </div>
                        </div>

                        <div className="timeline">
                            {roadmap.steps.map((step, index) => (
                                <div key={index} className="timeline-item" style={{ animationDelay: `${index * 0.1}s` }}>
                                    <div className="timeline-marker">
                                        <span>{step.stepNumber}</span>
                                    </div>
                                    <div className="timeline-content">
                                        <div className="step-header">
                                            <h3>{step.title}</h3>
                                            <span className="duration-badge">{step.estimatedTime}</span>
                                        </div>
                                        <p>{step.description}</p>
                                        <div className="topics-list">
                                            {step.topics.map((topic, i) => (
                                                <span key={i} className="topic-tag">
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default RoadmapPage;
