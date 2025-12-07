// Serverless-optimized database connection for Vercel
const { Pool } = require('pg');

// Global connection pool for reuse across function invocations
let pool;

/**
 * Get or create database connection pool
 * Reuses existing pool to avoid connection exhaustion
 */
function getPool() {
    if (!pool) {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL environment variable is not set');
        }

        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            },
            // Serverless-optimized settings
            max: 1, // Limit connections per function instance
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        });

        pool.on('error', (err) => {
            console.error('Unexpected database error:', err);
            pool = null; // Reset pool on error
        });
    }

    return pool;
}

/**
 * Execute a database query
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
async function query(text, params) {
    const client = getPool();
    try {
        const result = await client.query(text, params);
        return result;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

/**
 * Get a client from the pool for transactions
 * Remember to release the client after use!
 */
async function getClient() {
    const client = await getPool().connect();
    return client;
}

module.exports = {
    query,
    getClient,
    getPool
};
