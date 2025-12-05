const { pool } = require('./connection');

const createTable = async () => {
    try {
        console.log('Creating atom_certificates table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS atom_certificates (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                track_id UUID NOT NULL REFERENCES atom_tracks(id) ON DELETE CASCADE,
                recipient_name VARCHAR(255) NOT NULL,
                track_title VARCHAR(255) NOT NULL,
                verification_hash VARCHAR(64) UNIQUE NOT NULL,
                completion_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                UNIQUE(user_id, track_id)
            );

            CREATE INDEX IF NOT EXISTS idx_atom_certificates_user ON atom_certificates(user_id);
            CREATE INDEX IF NOT EXISTS idx_atom_certificates_hash ON atom_certificates(verification_hash);
        `);
        console.log('✅ atom_certificates table created successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to create table:', error);
        process.exit(1);
    }
};

createTable();
