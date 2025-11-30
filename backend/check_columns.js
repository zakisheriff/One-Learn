require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkColumns() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'courses';
        `);
        console.log('Columns in courses table:');
        res.rows.forEach(row => {
            console.log(`${row.column_name} (${row.data_type})`);
        });
    } catch (err) {
        console.error('Error querying schema:', err);
    } finally {
        await pool.end();
    }
}

checkColumns();
