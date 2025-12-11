// PostgreSQL Database Connection Pool
const { Pool } = require('pg');
require('dotenv').config();

// Create connection pool
if (!process.env.DATABASE_URL) {
    console.error('❌ FATAL ERROR: DATABASE_URL is not defined.');
    console.error('Please ensure you have provisioned a PostgreSQL database in Railway and linked it to this service.');
}

const isProduction = process.env.NODE_ENV === 'production';
const connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 60000,
};

// Only add SSL if NOT explicitly disabled in the connection string
// Fly.io internal URLs usually have sslmode=disable
if (isProduction && (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes('sslmode=disable'))) {
    connectionConfig.ssl = { rejectUnauthorized: false };
}
// If sslmode=disable is in the URL, we do NOT set connectionConfig.ssl at all.
// The pg library will respect the connection string.

const pool = new Pool(connectionConfig);

// Test connection on startup
pool.on('connect', () => {
    console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
    process.exit(-1);
});

// Helper function to execute queries
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

module.exports = {
    pool,
    query
};
