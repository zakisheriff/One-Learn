const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Supabase Connection String
const DATABASE_URL = 'postgres://postgres.auwvfnzwxxfnrpvsqvlv:Zakizaki$5@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres';

process.env.DATABASE_URL = DATABASE_URL; // Set for seed_courses.js

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        console.log('🚀 Starting Migration to Supabase...');

        // 1. Base Schema
        console.log('📄 Applying Base Schema (schema.sql)...');
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schemaSql);
        console.log('✅ Base Schema applied.');

        // 2. Atom Schema
        console.log('⚛️  Applying Atom Schema (atom_schema.sql)...');
        const atomSchemaPath = path.join(__dirname, '../database/atom_schema.sql');
        const atomSchemaSql = fs.readFileSync(atomSchemaPath, 'utf8');
        await pool.query(atomSchemaSql);
        console.log('✅ Atom Schema applied.');

        // 3. Atom Certificates Table
        console.log('📜 Creating Atom Certificates Table...');
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
        console.log('✅ Atom Certificates Table created.');

        // 4. Update Schema (Missing Columns)
        console.log('🔧 Applying schema updates (missing columns)...');
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '[]'`);
        await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255)`);
        console.log('✅ Schema updates applied.');

        // 5. Seed Courses
        console.log('🌱 Seeding Courses (this may take a moment)...');
        // We override the pool in seed_courses.js by mocking or just require it if it uses process.env.DATABASE_URL
        // Since seed_courses.js creates its own pool using env var, setting process.env.DATABASE_URL above works.
        // But we need to make sure we don't have conflicts. 
        // Best way: Execute it as a child process to ensure clean environment or just require it.
        // Requiring it will run it immediately.

        require('../seed_courses.js');

        // Note: seed_courses.js is async but not exported as a promise we can await easily if it auto-runs.
        // It ends with generateCourses(); which is async but not awaited by require.
        // We will just let it run. It logs 'Successfully seeded courses!' when done.

    } catch (err) {
        console.error('❌ Migration Failed:', err);
    }
}

migrate();
