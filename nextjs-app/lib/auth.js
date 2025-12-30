// Authentication utilities for Next.js API routes
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

/**
 * Verify JWT token and return user data
 * @param {Request} request - Next.js request object
 * @returns {Promise<{userId: number, email: string} | null>}
 */
export async function verifyAuth(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        return {
            userId: decoded.userId,
            email: decoded.email
        };
    } catch (error) {
        console.error('Auth verification error:', error);
        return null;
    }
}

/**
 * Require authentication - throws if not authenticated
 * Use this in API routes that need authentication
 */
export async function requireAuth(request) {
    const user = await verifyAuth(request);

    if (!user) {
        return Response.json(
            { error: 'Authentication required. Please log in.' },
            { status: 401 }
        );
    }

    return user;
}

/**
 * Generate JWT token
 * @param {Object} payload - {userId, email}
 * @returns {string}
 */
export function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '7d' // Token expires in 7 days
    });
}

/**
 * Set auth cookie in response
 * @param {string} token - JWT token
 * @returns {Object} - Response headers
 */
export function setAuthCookie(token) {
    const isProduction = process.env.NODE_ENV === 'production';
    const secureFlag = isProduction ? 'Secure;' : '';

    return {
        'Set-Cookie': `auth_token=${token}; HttpOnly; ${secureFlag} SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`
    };
}

/**
 * Clear auth cookie
 * @returns {Object} - Response headers
 */
export function clearAuthCookie() {
    const isProduction = process.env.NODE_ENV === 'production';
    const secureFlag = isProduction ? 'Secure;' : '';

    return {
        'Set-Cookie': `auth_token=; HttpOnly; ${secureFlag} SameSite=Lax; Path=/; Max-Age=0`
    };
}

export default {
    verifyAuth,
    requireAuth,
    generateToken,
    setAuthCookie,
    clearAuthCookie
};
