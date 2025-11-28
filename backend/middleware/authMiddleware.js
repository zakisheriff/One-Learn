// JWT Authentication Middleware
// Verifies JWT from HttpOnly cookie and attaches user to request

const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token from HttpOnly cookie
 * Attaches user object to req.user if valid
 */
const authenticateToken = (req, res, next) => {
    try {
        // Extract token from HttpOnly cookie
        const token = req.cookies.auth_token;

        if (!token) {
            return res.status(401).json({
                error: 'Authentication required. Please log in.'
            });
        }

        // Verify token
        jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev_only', (err, decoded) => {
            if (err) {
                // Token is invalid or expired
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({
                        error: 'Session expired. Please log in again.'
                    });
                }
                return res.status(403).json({
                    error: 'Invalid authentication token.'
                });
            }

            // Attach user info to request
            req.user = {
                userId: decoded.userId,
                email: decoded.email
            };

            next();
        });

    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for routes that work differently for authenticated users
 */
const optionalAuth = (req, res, next) => {
    try {
        const token = req.cookies.auth_token;

        if (!token) {
            req.user = null;
            return next();
        }

        jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev_only', (err, decoded) => {
            if (err) {
                req.user = null;
            } else {
                req.user = {
                    userId: decoded.userId,
                    email: decoded.email
                };
            }
            next();
        });

    } catch (error) {
        req.user = null;
        next();
    }
};

module.exports = {
    authenticateToken,
    optionalAuth
};
