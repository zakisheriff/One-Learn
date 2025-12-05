const { pool } = require('./connection');

const updateXP = async () => {
    try {
        console.log('Updating XP Rewards...');
        // Update Python Track Modules (Track ID 1 usually, or fetch by slug)
        // We assume the order is 1, 2, 3, 4 based on seed

        // Get Python Track ID
        const trackRes = await pool.query("SELECT id FROM atom_tracks WHERE slug = 'python-foundations'");
        if (trackRes.rows.length === 0) {
            console.error('Python track not found');
            process.exit(1);
        }
        const trackId = trackRes.rows[0].id;

        // Update modules
        // Module 1: 20 XP
        await pool.query("UPDATE atom_modules SET xp_reward = 20 WHERE track_id = $1 AND order_index = 1", [trackId]);
        // Module 2: 20 XP
        await pool.query("UPDATE atom_modules SET xp_reward = 20 WHERE track_id = $1 AND order_index = 2", [trackId]);
        // Module 3: 20 XP
        await pool.query("UPDATE atom_modules SET xp_reward = 20 WHERE track_id = $1 AND order_index = 3", [trackId]);
        // Module 4: 40 XP
        await pool.query("UPDATE atom_modules SET xp_reward = 40 WHERE track_id = $1 AND order_index = 4", [trackId]);

        console.log('✅ XP Rewards Updated: 20, 20, 20, 40');
        process.exit(0);
    } catch (error) {
        console.error('Update failed:', error);
        process.exit(1);
    }
};

updateXP();
