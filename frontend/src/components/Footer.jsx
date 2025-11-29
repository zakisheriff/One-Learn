import React from 'react';
import { Link } from 'react-router-dom';
import {
    LinkedInIcon, TwitterIcon, InstagramIcon, GitHubIcon,
    GlobeIcon
} from './Icons';
import '../styles/Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-top">
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo" onClick={() => window.scrollTo(0, 0)}>You Learn</Link>
                        <p className="footer-tagline">Empowering your learning journey with world-class courses and expert instructors.</p>
                    </div>

                    <div className="footer-links-grid">
                        <div className="footer-column">
                            <h4>Browse</h4>
                            <Link to="/explore?category=technology" onClick={() => window.scrollTo(0, 0)}>Technology</Link>
                            <Link to="/explore?category=business" onClick={() => window.scrollTo(0, 0)}>Business</Link>
                            <Link to="/explore?category=creative" onClick={() => window.scrollTo(0, 0)}>Creative</Link>
                            <Link to="/explore?category=health" onClick={() => window.scrollTo(0, 0)}>Health & Fitness</Link>
                        </div>

                        <div className="footer-column">
                            <h4>Company</h4>
                            <Link to="/about" onClick={() => window.scrollTo(0, 0)}>About Us</Link>
                            <Link to="/careers" onClick={() => window.scrollTo(0, 0)}>Careers</Link>
                            <Link to="/press" onClick={() => window.scrollTo(0, 0)}>Press</Link>
                            <Link to="/blog" onClick={() => window.scrollTo(0, 0)}>Blog</Link>
                        </div>

                        <div className="footer-column">
                            <h4>Support</h4>
                            <Link to="/help" onClick={() => window.scrollTo(0, 0)}>Help Center</Link>
                            <Link to="/contact" onClick={() => window.scrollTo(0, 0)}>Contact Us</Link>
                            <Link to="/community" onClick={() => window.scrollTo(0, 0)}>Community</Link>
                            <Link to="/accessibility" onClick={() => window.scrollTo(0, 0)}>Accessibility</Link>
                        </div>

                        <div className="footer-column">
                            <h4>Legal</h4>
                            <Link to="/privacy" onClick={() => window.scrollTo(0, 0)}>Privacy Policy</Link>
                            <Link to="/terms" onClick={() => window.scrollTo(0, 0)}>Terms of Service</Link>
                            <Link to="/cookies" onClick={() => window.scrollTo(0, 0)}>Cookie Policy</Link>
                            <Link to="/security" onClick={() => window.scrollTo(0, 0)}>Security</Link>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-copyright">
                        <p>&copy; {new Date().getFullYear()} You Learn. All rights reserved.</p>
                    </div>

                    <div className="footer-social">
                        <a href="https://linkedin.com/in/zakisheriff" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                            <LinkedInIcon size={20} />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                            <TwitterIcon size={20} />
                        </a>
                        <a href="https://instagram.com/zakisherifff" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <InstagramIcon size={20} />
                        </a>
                        <a href="https://github.com/zakisheriff" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                            <GitHubIcon size={20} />
                        </a>
                    </div>

                    <div className="footer-language">
                        <GlobeIcon size={16} />
                        <span>English (US)</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
