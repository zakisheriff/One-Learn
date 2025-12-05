const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { pool } = require('./connection');

async function applyCertSchema() {
    try {
        console.log('Applying Atom Certificates schema...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS atom_certificates (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                track_id UUID NOT NULL REFERENCES atom_tracks(id) ON DELETE CASCADE,
                recipient_name VARCHAR(255) NOT NULL,
                track_title VARCHAR(255) NOT NULL,
                verification_hash VARCHAR(255) UNIQUE NOT NULL,
                completion_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                UNIQUE(user_id, track_id)
            );
        `);

        console.log('✅ Atom Certificates schema applied.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to apply schema:', error);
        process.exit(1);
    }
}

applyCertSchema();
