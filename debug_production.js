const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkData() {
    try {
        console.log('Checking database content...');
        const res = await pool.query('SELECT id, title, thumbnail_url FROM courses LIMIT 5');
        console.log('First 5 courses:');
        res.rows.forEach(row => {
            console.log(`- ${row.title}: ${row.thumbnail_url}`);
        });
        pool.end();
    } catch (err) {
        console.error('Error:', err);
        pool.end();
    }
}

checkData();
