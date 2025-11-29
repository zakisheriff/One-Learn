import React from 'react';
import { BookIcon } from './Icons';

const Logo = ({ size = 24, className = '', iconSize = 24 }) => {
    return (
        <div className={`logo-container ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: `${size}px`, color: 'var(--color-text-primary)', lineHeight: 1 }}>
            <div style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center' }}>
                <BookIcon size={iconSize} />
            </div>
        </div>
    );
};

export default Logo;
