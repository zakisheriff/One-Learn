import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
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
            setRoadmap({
                ...response.data.roadmap,
                courseMap: response.data.courseMap || {}
            });
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
            <main className="roadmap-container">
                <div className="roadmap-hero">
                    <div className="hero-badge">
                        <StarIcon size={14} color="#0a66c2" filled /> AI-Powered Learning Paths
                    </div>
                    <h1>Design Your Future Career</h1>
                    <p>Tell us your dream role, and our AI will build a personalized, step-by-step roadmap just for you.</p>

                    {!roadmap && (
                        <>
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

                            {/* Benefits Section */}
                            <div className="benefits-section">
                                <h2>Why Use AI Roadmaps?</h2>
                                <div className="benefits-grid">
                                    <div className="benefit-card">
                                        <div className="benefit-icon">
                                            <TargetIcon size={24} color="#0a66c2" />
                                        </div>
                                        <h3>Personalized Path</h3>
                                        <p>Get a custom learning journey tailored to your specific career goals and current skill level.</p>
                                    </div>
                                    <div className="benefit-card">
                                        <div className="benefit-icon">
                                            <BookIcon size={24} color="#0a66c2" />
                                        </div>
                                        <h3>Curated Resources</h3>
                                        <p>Access hand-picked courses and materials from top platforms, all in one organized path.</p>
                                    </div>
                                    <div className="benefit-card">
                                        <div className="benefit-icon">
                                            <CheckIcon size={24} color="#0a66c2" />
                                        </div>
                                        <h3>Track Progress</h3>
                                        <p>Monitor your advancement through each step and celebrate milestones along the way.</p>
                                    </div>
                                </div>
                            </div>

                            {/* How It Works Section */}
                            <div className="how-it-works-section">
                                <h2>How It Works</h2>
                                <div className="steps-grid">
                                    <div className="work-step">
                                        <div className="step-number">1</div>
                                        <h3>Enter Your Goal</h3>
                                        <p>Tell us what role or skill you want to achieve</p>
                                    </div>
                                    <div className="work-step">
                                        <div className="step-number">2</div>
                                        <h3>AI Analyzes</h3>
                                        <p>Our AI creates a personalized learning path</p>
                                    </div>
                                    <div className="work-step">
                                        <div className="step-number">3</div>
                                        <h3>Start Learning</h3>
                                        <p>Follow the roadmap and track your progress</p>
                                    </div>
                                </div>
                            </div>
                        </>
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
                                        {step.recommendedCourses && step.recommendedCourses.length > 0 && (
                                            <div className="recommended-courses">
                                                <h4>
                                                    <BookIcon size={16} color="#0a66c2" />
                                                    <span>Recommended Courses</span>
                                                </h4>
                                                <ul>
                                                    {step.recommendedCourses.map((courseTitle, i) => {
                                                        const slug = roadmap.courseMap?.[courseTitle];
                                                        return slug ? (
                                                            <li key={i}>
                                                                <Link to={`/course/${slug}`} onClick={() => window.scrollTo(0, 0)}>
                                                                    <BookIcon size={14} color="#0a66c2" />
                                                                    <span>{courseTitle}</span>
                                                                    <ArrowRightIcon size={14} color="#0a66c2" />
                                                                </Link>
                                                            </li>
                                                        ) : (
                                                            <li key={i} className="no-link">
                                                                <BookIcon size={14} color="#86868b" />
                                                                <span>{courseTitle}</span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        )}
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
