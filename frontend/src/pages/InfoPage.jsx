import React from 'react';
import Navbar from '../components/Navbar';
import { footerContent } from '../data/footerContent';
import '../styles/InfoPage.css';

const InfoPage = ({ pageKey }) => {
    const data = footerContent[pageKey];

    if (!data) {
        return (
            <div className="info-page">
                <Navbar />
                <div className="info-container">
                    <div className="info-header">
                        <h1>Page Not Found</h1>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="info-page">
            <Navbar />
            <div className="info-container">
                <div className="info-header">
                    <h1>{data.title}</h1>
                </div>
                <div className="info-content">
                    {data.content}
                </div>
            </div>
        </div>
    );
};

export default InfoPage;
