require('dotenv').config();
const { pool } = require('./database/connection');
const fs = require('fs');
const path = require('path');

const applySchema = async () => {
    try {
        console.log('📄 Reading schema.sql...');
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('🛠️  Applying schema...');
        await pool.query(schemaSql);

        console.log('✅ Schema applied successfully! Tables created.');
    } catch (err) {
        console.error('❌ Error applying schema:', err);
    } finally {
        await pool.end();
    }
};

applySchema();
