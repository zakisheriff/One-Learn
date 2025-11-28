import React from 'react';
import './GlassCard.css';

const GlassCard = ({
    children,
    className = '',
    hover = true,
    strong = false,
    onClick,
    style
}) => {
    const cardClass = strong ? 'glass-card-strong' : 'glass-card';
    const hoverClass = hover ? 'glass-card-hover' : '';

    return (
        <div
            className={`${cardClass} ${hoverClass} ${className}`}
            onClick={onClick}
            style={style}
        >
            {children}
        </div>
    );
};

export default GlassCard;
