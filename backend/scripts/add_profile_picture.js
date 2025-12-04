const { pool } = require('../database/connection');

async function migrate() {
    try {
        console.log('Adding profile_picture column to users table...');

        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS profile_picture TEXT;
        `);

        console.log('Successfully added profile_picture column.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
