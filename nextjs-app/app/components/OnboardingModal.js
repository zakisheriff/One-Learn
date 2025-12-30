'use client';

import React, { useState, useContext, useRef, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
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
    const contentRef = useRef(null);

    // Load saved interests from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('onboarding_interests');
        if (saved) {
            try {
                setSelectedInterests(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse saved interests', e);
            }
        }
    }, []);

    // Ensure modal starts at the top when opened
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, []);

    const toggleInterest = (topic) => {
        setSelectedInterests(prev => {
            const newInterests = prev.includes(topic)
                ? prev.filter(t => t !== topic)
                : [...prev, topic];

            localStorage.setItem('onboarding_interests', JSON.stringify(newInterests));
            return newInterests;
        });
    };

    const handleSubmit = async () => {
        if (selectedInterests.length === 0) return;

        setLoading(true);
        try {
            const response = await axios.put('/api/auth/interests', {
                interests: selectedInterests
            });

            // Update user context with new interests
            // API returns message currently, need to fix API to return interests or use local
            // Better to fix API, but for now use selectedInterests if API doesn't return
            setUser({ ...user, interests: response.data.interests || selectedInterests });

            localStorage.removeItem('onboarding_interests');
            onClose();
        } catch (error) {
            console.error('Failed to save interests:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-content" ref={contentRef}>
                <div className="onboarding-header">
                    <h2 className="onboarding-title">
                        Welcome to One Learn!
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