const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { pool } = require('./connection');
const fs = require('fs');

async function applySchema() {
    try {
        console.log('Applying Atom Path schema...');
        const schemaPath = path.join(__dirname, 'atom_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        await pool.query(schemaSql);
        console.log('✅ Atom Path schema applied successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to apply schema:', error);
        process.exit(1);
    }
}

applySchema();
