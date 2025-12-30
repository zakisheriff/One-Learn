import React from 'react';
import '../styles/LoadingSpinner.css';

export default function LoadingSpinner({ fullScreen = false, text = 'One Learn' }) {
    return (
        <div className={`spinner-container ${fullScreen ? 'fullscreen' : ''}`}>
            <div className="spinner"></div>
            {text && <p className="loading-text">{text}</p>}
        </div>
    );
}
