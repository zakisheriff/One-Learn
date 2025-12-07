// Authentication API - Vercel Serverless Function
// Handles: /api/auth/register, /api/auth/login, /api/auth/google, /api/auth/logout, /api/auth/me

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { query } = require('../_lib/db');
const { cors, requireAuth, handleError, setCookie, clearCookie } = require('../_lib/middleware');
const { parseBody, getQueryParams } = require('../_lib/utils');

const SALT_ROUNDS = 10;
const JWT_EXPIRY = '7d';

let googleClient;
function getGoogleClient() {
    if (!googleClient && process.env.GOOGLE_CLIENT_ID) {
        googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }
    return googleClient;
}

module.exports = async (req, res) => {
    // Handle CORS
    if (cors(req, res)) return;

    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const path = url.pathname.replace('/api/auth/', '');

        // Route handling
        if (path === 'register' && req.method === 'POST') {
            return await handleRegister(req, res);
        } else if (path === 'login' && req.method === 'POST') {
            return await handleLogin(req, res);
        } else if (path === 'google' && req.method === 'POST') {
            return await handleGoogleAuth(req, res);
        } else if (path === 'logout' && req.method === 'POST') {
            return await handleLogout(req, res);
        } else if (path === 'me' && req.method === 'GET') {
            return await handleGetCurrentUser(req, res);
        } else if (path === 'interests' && req.method === 'PUT') {
            return await handleUpdateInterests(req, res);
        } else if (path === 'profile' && req.method === 'PUT') {
            return await handleUpdateProfile(req, res);
        } else if (path === 'password' && req.method === 'PUT') {
            return await handleUpdatePassword(req, res);
        } else if (path === 'account' && req.method === 'DELETE') {
            return await handleDeleteAccount(req, res);
        } else {
            res.status(404).json({ error: 'Not found' });
        }
    } catch (error) {
        handleError(res, error);
    }
};

// Register handler
async function handleRegister(req, res) {
    const { fullName, email, password } = await parseBody(req);

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

    // Check if user exists
    const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
        return res.status(409).json({
            error: 'User with this email already exists'
        });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const result = await query(
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

    // Set cookie
    setCookie(res, 'auth_token', token);

    res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: user.id,
            fullName: user.full_name,
            email: user.email
        }
    });
}

// Login handler
async function handleLogin(req, res) {
    const { email, password } = await parseBody(req);

    if (!email || !password) {
        return res.status(400).json({
            error: 'Email and password are required'
        });
    }

    // Find user
    const result = await query(
        'SELECT id, full_name, email, password_hash, interests, profile_picture FROM users WHERE email = $1',
        [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
        return res.status(401).json({
            error: 'Invalid email or password'
        });
    }

    const user = result.rows[0];

    if (!user.password_hash) {
        return res.status(401).json({
            error: 'This account uses Google sign-in. Please use "Sign in with Google"'
        });
    }

    // Verify password
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

    setCookie(res, 'auth_token', token);

    res.json({
        message: 'Login successful',
        user: {
            id: user.id,
            fullName: user.full_name,
            email: user.email,
            interests: user.interests || [],
            profilePicture: user.profile_picture
        }
    });
}

// Google OAuth handler
async function handleGoogleAuth(req, res) {
    const { credential } = await parseBody(req);

    if (!credential) {
        return res.status(400).json({
            error: 'Google credential is required'
        });
    }

    const client = getGoogleClient();
    if (!client) {
        return res.status(500).json({
            error: 'Google OAuth not configured'
        });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // Check if user exists
    let result = await query(
        'SELECT id, full_name, email, profile_picture, interests FROM users WHERE oauth_provider = $1 AND oauth_id = $2',
        ['google', googleId]
    );

    let user;

    if (result.rows.length === 0) {
        // Check if email exists
        const emailCheck = await query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (emailCheck.rows.length > 0) {
            return res.status(409).json({
                error: 'An account with this email already exists. Please use regular login.'
            });
        }

        // Create new user
        result = await query(
            `INSERT INTO users (full_name, email, oauth_provider, oauth_id, profile_picture) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING id, full_name, email, profile_picture`,
            [name, email.toLowerCase(), 'google', googleId, payload.picture]
        );

        user = result.rows[0];
    } else {
        user = result.rows[0];
        // Update profile picture if changed
        if (payload.picture && user.profile_picture !== payload.picture && !user.profile_picture?.startsWith('/uploads')) {
            await query(
                'UPDATE users SET profile_picture = $1 WHERE id = $2',
                [payload.picture, user.id]
            );
            user.profile_picture = payload.picture;
        }
    }

    // Generate JWT
    const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
    );

    setCookie(res, 'auth_token', token);

    res.json({
        message: 'Google authentication successful',
        user: {
            id: user.id,
            fullName: user.full_name,
            email: user.email,
            interests: user.interests || [],
            profilePicture: user.profile_picture
        }
    });
}

// Logout handler
async function handleLogout(req, res) {
    clearCookie(res, 'auth_token');
    res.json({ message: 'Logout successful' });
}

// Get current user handler
async function handleGetCurrentUser(req, res) {
    const user = requireAuth(req, res);
    if (!user) return;

    const result = await query(
        'SELECT id, full_name, email, created_at, interests, profile_picture FROM users WHERE id = $1',
        [user.userId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
    }

    const userData = result.rows[0];

    res.json({
        user: {
            id: userData.id,
            fullName: userData.full_name,
            email: userData.email,
            createdAt: userData.created_at,
            interests: userData.interests || [],
            profilePicture: userData.profile_picture
        }
    });
}

// Update interests handler
async function handleUpdateInterests(req, res) {
    const user = requireAuth(req, res);
    if (!user) return;

    const { interests } = await parseBody(req);

    if (!Array.isArray(interests)) {
        return res.status(400).json({ error: 'Interests must be an array' });
    }

    const result = await query(
        'UPDATE users SET interests = $1 WHERE id = $2 RETURNING interests',
        [JSON.stringify(interests), user.userId]
    );

    res.json({
        message: 'Interests updated successfully',
        interests: result.rows[0].interests
    });
}

// Update profile handler
async function handleUpdateProfile(req, res) {
    const user = requireAuth(req, res);
    if (!user) return;

    const { fullName, email } = await parseBody(req);

    if (!fullName || !email) {
        return res.status(400).json({ error: 'Full name and email are required' });
    }

    // Check if email is taken
    const emailCheck = await query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.toLowerCase(), user.userId]
    );

    if (emailCheck.rows.length > 0) {
        return res.status(409).json({ error: 'Email already in use' });
    }

    const result = await query(
        'UPDATE users SET full_name = $1, email = $2 WHERE id = $3 RETURNING id, full_name, email',
        [fullName, email.toLowerCase(), user.userId]
    );

    const userData = result.rows[0];

    res.json({
        message: 'Profile updated successfully',
        user: {
            id: userData.id,
            fullName: userData.full_name,
            email: userData.email
        }
    });
}

// Update password handler
async function handleUpdatePassword(req, res) {
    const user = requireAuth(req, res);
    if (!user) return;

    const { currentPassword, newPassword } = await parseBody(req);

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    // Get current password hash
    const userResult = await query(
        'SELECT password_hash FROM users WHERE id = $1',
        [user.userId]
    );

    const userData = userResult.rows[0];

    if (!userData.password_hash) {
        return res.status(400).json({ error: 'This account uses Google sign-in. Cannot change password.' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, userData.password_hash);

    if (!isValid) {
        return res.status(401).json({ error: 'Incorrect current password' });
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [newHash, user.userId]
    );

    res.json({ message: 'Password updated successfully' });
}

// Delete account handler
async function handleDeleteAccount(req, res) {
    const user = requireAuth(req, res);
    if (!user) return;

    await query('DELETE FROM users WHERE id = $1', [user.userId]);

    clearCookie(res, 'auth_token');

    res.json({ message: 'Account deleted successfully' });
}
