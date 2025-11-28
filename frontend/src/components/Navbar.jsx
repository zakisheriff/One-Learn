import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import '../styles/Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="navbar-logo">
                    You Learn
                </Link>

                <div className="navbar-links">
                    <Link to="/" className="nav-link">Courses</Link>

                    {user ? (
                        <>
                            <Link to="/dashboard" className="nav-link">Dashboard</Link>
                            <button onClick={handleLogout} className="nav-link-button">
                                Logout
                            </button>
                            <div className="user-badge">
                                {user.fullName.charAt(0).toUpperCase()}
                            </div>
                        </>
                    ) : (
                        <Link to="/login" className="nav-button">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
