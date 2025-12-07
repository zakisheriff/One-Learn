// Shared middleware for Vercel serverless functions
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

/**
 * CORS middleware for serverless functions
 */
function cors(req, res) {
    const origin = process.env.FRONTEND_URL || 'https://onelearn.theoneatom.com';

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return true;
    }

    return false;
}

/**
 * Authentication middleware
 * Verifies JWT token from cookies
 */
function authenticate(req, res) {
    try {
        // Parse cookies
        const cookies = cookie.parse(req.headers.cookie || '');
        const token = cookies.token;

        if (!token) {
            return {
                authenticated: false,
                error: 'No authentication token provided'
            };
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        return {
            authenticated: true,
            user: decoded
        };
    } catch (error) {
        return {
            authenticated: false,
            error: 'Invalid or expired token'
        };
    }
}

/**
 * Require authentication middleware
 * Returns 401 if not authenticated
 */
function requireAuth(req, res) {
    const auth = authenticate(req, res);

    if (!auth.authenticated) {
        res.status(401).json({
            error: 'Unauthorized',
            message: auth.error
        });
        return null;
    }

    return auth.user;
}

/**
 * Error handler
 */
function handleError(res, error, statusCode = 500) {
    console.error('API Error:', error);

    res.status(statusCode).json({
        error: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
}

/**
 * Set cookie helper
 */
function setCookie(res, name, value, options = {}) {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        ...options
    };

    res.setHeader('Set-Cookie', cookie.serialize(name, value, cookieOptions));
}

/**
 * Clear cookie helper
 */
function clearCookie(res, name) {
    res.setHeader('Set-Cookie', cookie.serialize(name, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0
    }));
}

module.exports = {
    cors,
    authenticate,
    requireAuth,
    handleError,
    setCookie,
    clearCookie
};
