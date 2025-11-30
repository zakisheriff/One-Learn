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

        // Add missing columns to courses table
        await pool.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS estimated_hours VARCHAR(50)`);
        await pool.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS likes VARCHAR(50)`);
        await pool.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS views VARCHAR(50)`);
        await pool.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS category VARCHAR(100)`);
        await pool.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS level VARCHAR(50)`);
        await pool.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS type VARCHAR(50)`);
        await pool.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS subject VARCHAR(100)`);
        await pool.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor VARCHAR(100)`);
        console.log('✅ Added missing columns to courses table');

        console.log('Schema update complete!');
    } catch (err) {
        console.error('❌ Error updating schema:', err);
    } finally {
        await pool.end();
    }
};

updateSchema();
