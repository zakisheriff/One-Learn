
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

const logFile = 'db-test-result.txt';

async function testConnection() {
    const config = {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };

    let output = `Testing Database Connection...\n`;
    output += `NODE_ENV: ${process.env.NODE_ENV}\n`;
    output += `DATABASE_URL provided: ${!!process.env.DATABASE_URL}\n`;

    if (process.env.DATABASE_URL) {
        // Hide password in logs
        const sanitizedUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
        output += `DATABASE_URL format: ${sanitizedUrl}\n`;
    }

    const pool = new Pool(config);

    try {
        const client = await pool.connect();
        output += 'Successfully connected to database!\n';

        const res = await client.query('SELECT NOW()');
        output += `Database Time: ${res.rows[0].now}\n`;

        // Test the getAllCourses query
        output += '\nTesting getAllCourses Query...\n';
        const query = `
            SELECT 
                c.id, c.slug, c.title, c.description, c.thumbnail_url,
                COUNT(DISTINCT m.id) as module_count,
                COUNT(DISTINCT l.id) as lesson_count,
                SUM(l.duration_seconds) as total_duration_seconds
             FROM courses c
             LEFT JOIN modules m ON c.id = m.course_id
             LEFT JOIN lessons l ON m.id = l.module_id
             WHERE c.is_published = true
             GROUP BY c.id
             ORDER BY c.created_at DESC
        `;

        const resCourses = await client.query(query);
        output += `Query successful! Retrieved ${resCourses.rowCount} courses.\n`;
        if (resCourses.rowCount > 0) {
            output += `First course: ${resCourses.rows[0].title}\n`;
        }

        client.release();
    } catch (err) {
        output += `\nCONNECTION ERROR:\n${err.message}\n`;
        output += `Stack: ${err.stack}\n`;
        if (err.code) output += `Code: ${err.code}\n`;
    } finally {
        await pool.end();
        fs.writeFileSync(logFile, output);
        console.log('Test complete. Results written to ' + logFile);
    }
}

testConnection();
