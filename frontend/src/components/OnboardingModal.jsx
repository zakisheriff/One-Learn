import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import { CheckIcon } from './Icons';
import '../styles/OnboardingModal.css';

const INTEREST_TOPICS = [
    "Python", "JavaScript", "React", "Data Science", "Machine Learning",
    "Web Development", "Business", "Finance", "Design", "Marketing",
    "English", "Communication", "Health", "Music", "Photography"
];

const OnboardingModal = ({ onClose }) => {
    const { user, setUser } = useContext(AuthContext);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [loading, setLoading] = useState(false);

    const toggleInterest = (topic) => {
        setSelectedInterests(prev =>
            prev.includes(topic)
                ? prev.filter(t => t !== topic)
                : [...prev, topic]
        );
    };

    const handleSubmit = async () => {
        if (selectedInterests.length === 0) return;

        setLoading(true);
        try {
            const response = await axios.put('/api/auth/interests', {
                interests: selectedInterests
            });

            // Update user context with new interests
            setUser({ ...user, interests: response.data.interests });
            onClose();
        } catch (error) {
            console.error('Failed to save interests:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-content">
                <div className="onboarding-header">
                    <h2 className="onboarding-title">
                        Welcome to You Learn!
                    </h2>
                    <p className="onboarding-subtitle">
                        What are you interested in learning today? We'll personalize your recommendations.
                    </p>
                </div>

                <div className="interests-grid">
                    {INTEREST_TOPICS.map(topic => (
                        <button
                            key={topic}
                            onClick={() => toggleInterest(topic)}
                            className={`interest-chip ${selectedInterests.includes(topic) ? 'selected' : ''}`}
                        >
                            {topic}
                            {selectedInterests.includes(topic) && <CheckIcon size={14} />}
                        </button>
                    ))}
                </div>

                <div className="onboarding-footer">
                    <button
                        onClick={handleSubmit}
                        disabled={selectedInterests.length === 0 || loading}
                        className="start-btn"
                    >
                        {loading ? 'Saving...' : 'Start Learning'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;
