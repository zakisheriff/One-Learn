require('dotenv').config({ path: './backend/.env' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const checkDb = async () => {
    try {
        const res = await pool.query('SELECT COUNT(*) FROM courses');
        console.log('Total courses in DB:', res.rows[0].count);

        const publishedRes = await pool.query('SELECT COUNT(*) FROM courses WHERE is_published = true');
        console.log('Published courses in DB:', publishedRes.rows[0].count);

        const sampleRes = await pool.query('SELECT title, category, likes, views, estimated_hours FROM courses LIMIT 5');
        console.log('Sample courses with new columns:', sampleRes.rows);

    } catch (err) {
        console.error('Error querying DB:', err);
    } finally {
        await pool.end();
    }
};

checkDb();
