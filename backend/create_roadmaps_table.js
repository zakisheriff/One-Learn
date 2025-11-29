require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const createTable = async () => {
    try {
        console.log('Creating roadmaps table...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS roadmaps (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                content JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_roadmaps_user ON roadmaps(user_id);
        `);

        console.log('✅ Roadmaps table created successfully!');
    } catch (error) {
        console.error('❌ Error creating table:', error);
    } finally {
        await pool.end();
    }
};

createTable();
