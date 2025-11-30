require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const updateSchema = async () => {
    try {
        console.log('Updating database schema...');

        // Add interests column to users table
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '[]'`);
        console.log('✅ Added interests column to users table');

        console.log('Schema update complete!');
    } catch (err) {
        console.error('❌ Error updating schema:', err);
    } finally {
        await pool.end();
    }
};

updateSchema();
