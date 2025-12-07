// Health Check API - Vercel Serverless Function
const { query } = require('./_lib/db');

module.exports = async (req, res) => {
    try {
        const dbResult = await query('SELECT NOW()');

        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'production',
            database: {
                connected: true,
                time: dbResult.rows[0].now
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'production',
            database: {
                connected: false,
                error: error.message
            }
        });
    }
};
