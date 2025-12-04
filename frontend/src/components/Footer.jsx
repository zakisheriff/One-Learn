import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LinkedInIcon, TwitterIcon, InstagramIcon, GitHubIcon,
    GlobeIcon
} from './Icons';
import '../styles/Footer.css';

const Footer = () => {
    const location = useLocation();
    const [activeSection, setActiveSection] = React.useState(null);

    // Don't show footer on login page
    if (location.pathname === '/login') {
        return null;
    }

    const toggleSection = (section) => {
        setActiveSection(prev => (prev === section ? null : section));
    };

    const footerLinks = [
        {
            title: "Browse",
            links: [
                { name: "Technology", path: "/explore?category=technology" },
                { name: "Business", path: "/explore?category=business" },
                { name: "Creative", path: "/explore?category=creative" },
                { name: "Health & Fitness", path: "/explore?category=health" }
            ]
        },
        {
            title: "Company",
            links: [
                { name: "About Us", path: "/about" },
                { name: "Careers", path: "/careers" },
                { name: "Press", path: "/press" },
                { name: "Blog", path: "/blog" }
            ]
        },
        {
            title: "Support",
            links: [
                { name: "Help Center", path: "/help" },
                { name: "Contact Us", path: "/contact" },
                { name: "Community", path: "/community" },
                { name: "Accessibility", path: "/accessibility" }
            ]
        },
        {
            title: "Legal",
            links: [
                { name: "Privacy Policy", path: "/privacy" },
                { name: "Terms of Service", path: "/terms" },
                { name: "Cookie Policy", path: "/cookies" },
                { name: "Security", path: "/security" }
            ]
        }
    ];

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-top">
                    <div className="footer-links-grid">
                        {footerLinks.map((section) => (
                            <div key={section.title} className={`footer-column ${activeSection === section.title ? 'active' : ''}`}>
                                <h4 onClick={() => toggleSection(section.title)}>
                                    {section.title}
                                    <span className="footer-chevron">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="18 15 12 9 6 15"></polyline>
                                        </svg>
                                    </span>
                                </h4>
                                <div className="footer-links-list">
                                    {section.links.map((link) => (
                                        <Link
                                            key={link.name}
                                            to={link.path}
                                            onClick={() => window.scrollTo(0, 0)}
                                        >
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-center-group">
                        <Link to="/" className="footer-logo-small" onClick={() => window.scrollTo(0, 0)}>One Learn</Link>
                        <span className="footer-divider">|</span>
                        <p className="footer-copyright-text">&copy; {new Date().getFullYear()} One Learn. All rights reserved.</p>
                    </div>

                    <div className="footer-social">
                        <a href="https://linkedin.com/in/zakisheriff" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                            <LinkedInIcon size={16} />
                        </a>
                        <a href="https://instagram.com/zakisherifff" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <InstagramIcon size={16} />
                        </a>
                        <a href="https://github.com/zakisheriff" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                            <GitHubIcon size={16} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
