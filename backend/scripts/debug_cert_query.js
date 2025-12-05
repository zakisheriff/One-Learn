const { pool } = require('../database/connection');

const debugQuery = async () => {
    try {
        console.log('🔍 Debugging Certificate Query...');

        // 1. Get the user who has a certificate
        const certRes = await pool.query('SELECT user_id, track_id FROM atom_certificates LIMIT 1');
        if (certRes.rows.length === 0) {
            console.log('❌ No atom_certificates found in DB.');
            process.exit(0);
        }
        const { user_id, track_id } = certRes.rows[0];
        console.log(`Found certificate for User: ${user_id}, Track: ${track_id}`);

        // 2. Check Track
        const trackRes = await pool.query('SELECT id, slug, title FROM atom_tracks WHERE id = $1', [track_id]);
        console.log('Track:', trackRes.rows[0]);

        // 3. Run the UNION query
        const query = `
            SELECT id, verification_hash, recipient_name, course_title, completion_date, issued_at, 'course' as type, co.slug as course_slug
             FROM certificates c
             JOIN courses co ON c.course_id = co.id
             WHERE c.user_id = $1
             
             UNION ALL
             
             SELECT id, verification_hash, recipient_name, track_title as course_title, completion_date, issued_at, 'atom' as type, t.slug as course_slug
             FROM atom_certificates ac
             JOIN atom_tracks t ON ac.track_id = t.id
             WHERE ac.user_id = $1
             
             ORDER BY issued_at DESC
        `;

        const result = await pool.query(query, [user_id]);
        console.log('Query Result:', result.rows);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
};

debugQuery();
