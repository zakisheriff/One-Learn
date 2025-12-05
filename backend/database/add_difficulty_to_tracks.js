const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { pool } = require('./connection');

async function migrate() {
    try {
        console.log('Applying migration: Add difficulty to atom_tracks...');

        await pool.query(`
            ALTER TABLE atom_tracks 
            ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50) DEFAULT 'beginner',
            ADD COLUMN IF NOT EXISTS icon_type VARCHAR(50) DEFAULT 'code';
        `);

        console.log('✅ Migration applied successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
