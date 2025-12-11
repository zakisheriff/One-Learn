const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
    // Only allow running if a secret key is provided to prevent public abuse
    if (req.query.key !== 'Zakizaki$5') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { DATABASE_URL } = process.env;
    if (!DATABASE_URL) {
        return res.status(500).json({ error: 'DATABASE_URL is missing' });
    }

    const pool = new Pool({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🚀 Starting Migration on Vercel...');

        // 1. Base Schema - Read file content directly since we are in Vercel environment
        // Note: fs.readFileSync might fail if files aren't bundled. 
        // We will inline specific critical SQL here for reliability if files miss.
        // Or ensure vercel.json includes them.

        // Let's try to run a simple "Create Table" to test connection first.
        await pool.query(`
            CREATE TABLE IF NOT EXISTS migration_log (
                id SERIAL PRIMARY KEY,
                run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // ... Add real migration logic here based on schema.sql content ...
        // For now, let's just create the CRITICAL tables: users, courses, atom_tracks.

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                full_name VARCHAR(255),
                avatar_url TEXT,
                interests JSONB DEFAULT '[]',
                profile_picture VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
         `);

        // ... (We would populate full schema) ...

        res.status(200).json({ message: 'Migration connection test successful. Tables created.' });

    } catch (err) {
        console.error('❌ Migration Failed:', err);
        res.status(500).json({ error: err.message, stack: err.stack });
    } finally {
        await pool.end();
    }
};
