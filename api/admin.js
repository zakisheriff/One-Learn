// Admin API - Vercel Serverless Function (Simplified)
// Note: For full admin functionality, consider using the Vercel dashboard or a separate admin panel

const { query } = require('../_lib/db');
const { cors, requireAuth, handleError } = require('../_lib/middleware');
const { parseBody } = require('../_lib/utils');

module.exports = async (req, res) => {
    // Handle CORS
    if (cors(req, res)) return;

    // Require authentication
    const user = requireAuth(req, res);
    if (!user) return;

    // Simple admin check (check if email contains 'admin')
    if (!user.email || !user.email.includes('admin')) {
        return res.status(403).json({ error: 'Admin access required' });
    }

    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const path = url.pathname.replace('/api/admin/', '');

        // Add admin endpoints as needed
        res.json({ message: 'Admin API - Use Vercel dashboard or database client for admin operations' });
    } catch (error) {
        handleError(res, error);
    }
};
