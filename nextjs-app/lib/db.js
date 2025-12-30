// Database connection for Next.js serverless
// Optimized for Vercel with connection pooling

import { Pool } from 'pg';

let pool;

// Get database connection pool (singleton pattern for serverless)
export function getPool() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? {
                rejectUnauthorized: false
            } : false,
            // Optimize for serverless
            max: 10, // Maximum pool size
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        pool.on('error', (err) => {
            console.error('Unexpected database pool error:', err);
        });
    }

    return pool;
}

// Execute a query
export async function query(text, params) {
    const pool = getPool();
    const start = Date.now();

    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;

        if (process.env.NODE_ENV === 'development') {
            console.log('Executed query', { text, duration, rows: res.rowCount });
        }

        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

// Get a client from the pool for transactions
export async function getClient() {
    const pool = getPool();
    return await pool.connect();
}

export default { query, getPool, getClient };
