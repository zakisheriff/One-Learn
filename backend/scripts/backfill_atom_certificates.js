const { pool } = require('../database/connection');
const AtomService = require('../services/atomService');
const atomCertificateService = require('../services/atomCertificateService');

const backfillCertificates = async () => {
    const client = await pool.connect();
    try {
        console.log('🔄 Starting Certificate Backfill...');

        // 1. Get all users
        const usersRes = await client.query('SELECT id, full_name FROM users');
        const users = usersRes.rows;

        // 2. Get all tracks
        const tracksRes = await client.query('SELECT id, title FROM atom_tracks WHERE is_published = true');
        const tracks = tracksRes.rows;

        console.log(`Found ${users.length} users and ${tracks.length} tracks.`);

        let generatedCount = 0;

        for (const user of users) {
            for (const track of tracks) {
                // Check if track is complete
                const isComplete = await AtomService.checkAndAwardBadges(user.id, track.id);

                if (isComplete) {
                    // Check if certificate exists
                    const certRes = await client.query(
                        'SELECT id FROM atom_certificates WHERE user_id = $1 AND track_id = $2',
                        [user.id, track.id]
                    );

                    if (certRes.rows.length === 0) {
                        console.log(`Generating certificate for ${user.full_name} - ${track.title}...`);
                        try {
                            await atomCertificateService.generateAtomCertificate(user.id, track.id);
                            generatedCount++;
                            console.log('✅ Certificate generated.');
                        } catch (err) {
                            console.error('❌ Failed to generate certificate:', err.message);
                        }
                    } else {
                        // console.log(`Certificate already exists for ${user.full_name} - ${track.title}`);
                    }
                }
            }
        }

        console.log(`\n🎉 Backfill Complete! Generated ${generatedCount} new certificates.`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Backfill Failed:', error);
        process.exit(1);
    } finally {
        client.release();
    }
};

backfillCertificates();
