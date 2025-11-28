// Authentication Controller - Handles user registration, login, and Google OAuth
// Uses Bcrypt for password hashing and JWT for session management

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../database/connection');

const SALT_ROUNDS = 10;
const JWT_EXPIRY = '7d';
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Register a new user with email and password
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Validation
        if (!fullName || !email || !password) {
            return res.status(400).json({ 
                error: 'Full name, email, and password are required' 
            });
        }

        if (password.length < 8) {
            return res.status(400).json({ 
                error: 'Password must be at least 8 characters long' 
            });
        }

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({ 
                error: 'User with this email already exists' 
            });
        }

        // Hash password with Bcrypt
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const result = await pool.query(
            `INSERT INTO users (full_name, email, password_hash) 
             VALUES ($1, $2, $3) 
             RETURNING id, full_name, email, created_at`,
            [fullName, email.toLowerCase(), passwordHash]
        );

        const user = result.rows[0];

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        // Set HttpOnly cookie to prevent XSS
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Login with email and password
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email and password are required' 
            });
        }

        // Find user
        const result = await pool.query(
            'SELECT id, full_name, email, password_hash FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }

        const user = result.rows[0];

        // Check if user registered with OAuth (no password)
        if (!user.password_hash) {
            return res.status(401).json({ 
                error: 'This account uses Google sign-in. Please use "Sign in with Google"' 
            });
        }

        // Verify password with Bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ 
                error: 'Invalid email or password' 
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        // Set HttpOnly cookie
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Google OAuth login/signup
 * POST /api/auth/google
 * Expects { credential: 'google_id_token' } from Google Sign-In
 */
exports.googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ 
                error: 'Google credential is required' 
            });
        }

        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload;

        // Check if user exists
        let result = await pool.query(
            'SELECT id, full_name, email FROM users WHERE oauth_provider = $1 AND oauth_id = $2',
            ['google', googleId]
        );

        let user;

        if (result.rows.length === 0) {
            // Check if email already exists with regular signup
            const emailCheck = await pool.query(
                'SELECT id FROM users WHERE email = $1',
                [email.toLowerCase()]
            );

            if (emailCheck.rows.length > 0) {
                return res.status(409).json({ 
                    error: 'An account with this email already exists. Please use regular login.' 
                });
            }

            // Create new user
            result = await pool.query(
                `INSERT INTO users (full_name, email, oauth_provider, oauth_id) 
                 VALUES ($1, $2, $3, $4) 
                 RETURNING id, full_name, email`,
                [name, email.toLowerCase(), 'google', googleId]
            );

            user = result.rows[0];
        } else {
            user = result.rows[0];
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        // Set HttpOnly cookie
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            message: 'Google authentication successful',
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ error: 'Google authentication failed' });
    }
};

/**
 * Logout - Clear authentication cookie
 * POST /api/auth/logout
 */
exports.logout = (req, res) => {
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    res.json({ message: 'Logout successful' });
};

/**
 * Get current user info
 * GET /api/auth/me
 * Protected route - requires authentication middleware
 */
exports.getCurrentUser = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, full_name, email, created_at FROM users WHERE id = $1',
            [req.user.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        res.json({
            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                createdAt: user.created_at
            }
        });

    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
