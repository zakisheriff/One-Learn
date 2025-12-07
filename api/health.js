// Health Check API - Vercel Serverless Function
const { Pool } = require('pg');

let pool;
function getPool() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: 1,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        });
    }
    return pool;
}

module.exports = async (req, res) => {
    try {
        const client = getPool();
        const dbResult = await client.query('SELECT NOW()');

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
