const { pool } = require('../database/connection');

class AtomService {
    /**
     * Award XP to a user
     */
    static async awardXP(userId, amount, sourceType, sourceId) {
        try {
            await pool.query(
                'INSERT INTO atom_xp_ledger (user_id, amount, source_type, source_id) VALUES ($1, $2, $3, $4)',
                [userId, amount, sourceType, sourceId]
            );
            return true;
        } catch (error) {
            console.error('Error awarding XP:', error);
            return false;
        }
    }

    /**
     * Get user's total XP
     */
    static async getUserXP(userId) {
        try {
            const result = await pool.query(
                'SELECT SUM(amount) as total_xp FROM atom_xp_ledger WHERE user_id = $1',
                [userId]
            );
            return parseInt(result.rows[0].total_xp) || 0;
        } catch (error) {
            console.error('Error getting user XP:', error);
            return 0;
        }
    }

    /**
     * Check and award badges based on track completion
     */
    static async checkAndAwardBadges(userId, trackId) {
        // Logic: If user completed all modules in a track, award the track badge
        // For now, we'll just check if the track is complete
        try {
            // 1. Get all modules for the track
            const modulesResult = await pool.query(
                'SELECT id FROM atom_modules WHERE track_id = $1',
                [trackId]
            );
            const moduleIds = modulesResult.rows.map(m => m.id);

            // 2. Check user progress for these modules
            const progressResult = await pool.query(
                'SELECT COUNT(*) as completed_count FROM atom_user_progress WHERE user_id = $1 AND module_id = ANY($2) AND status = $3',
                [userId, moduleIds, 'completed']
            );

            const completedCount = parseInt(progressResult.rows[0].completed_count);

            if (completedCount === moduleIds.length) {
                // Track is complete! Award Badge.
                // First, find or create badge for this track
                // For MVP, we assume badges exist or we create them dynamically
                // Let's just log it for now as we haven't seeded badges
                console.log(`User ${userId} completed track ${trackId}. Awarding Badge...`);

                // Return true to indicate track completion (trigger certificate)
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error checking badges:', error);
            return false;
        }
    }

    /**
     * Mark module as complete and handle rewards
     */
    static async completeModule(userId, moduleId, score = 100) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Update Progress
            await client.query(
                `INSERT INTO atom_user_progress (user_id, module_id, status, score, completed_at)
                 VALUES ($1, $2, 'completed', $3, NOW())
                 ON CONFLICT (user_id, module_id) 
                 DO UPDATE SET status = 'completed', score = $3, completed_at = NOW()`,
                [userId, moduleId, score]
            );

            // 2. Get Module Info (for XP reward)
            const moduleResult = await client.query(
                'SELECT xp_reward, track_id FROM atom_modules WHERE id = $1',
                [moduleId]
            );
            const module = moduleResult.rows[0];

            // 3. Award XP (if not already awarded for this module? - simplified: always award for now or check ledger)
            // Let's check if XP was already awarded to prevent farming
            const xpCheck = await client.query(
                'SELECT id FROM atom_xp_ledger WHERE user_id = $1 AND source_id = $2',
                [userId, moduleId]
            );

            let xpAwarded = 0;
            if (xpCheck.rows.length === 0) {
                await client.query(
                    'INSERT INTO atom_xp_ledger (user_id, amount, source_type, source_id) VALUES ($1, $2, $3, $4)',
                    [userId, module.xp_reward, 'module_completion', moduleId]
                );
                xpAwarded = module.xp_reward;
            }

            await client.query('COMMIT');

            // 4. Check for Track Completion (Badge/Certificate)
            // We do this outside the transaction or as a separate step
            const isTrackComplete = await this.checkAndAwardBadges(userId, module.track_id);

            if (isTrackComplete) {
                try {
                    const certService = require('./atomCertificateService');
                    await certService.generateAtomCertificate(userId, module.track_id);
                    console.log(`Certificate generated for user ${userId} track ${module.track_id}`);
                } catch (certError) {
                    console.error('Failed to auto-generate certificate:', certError);
                    // Don't fail the module completion if cert generation fails, but log it.
                }
            }

            return {
                success: true,
                xpAwarded,
                isTrackComplete,
                trackId: module.track_id
            };

        } catch (error) {
            await client.query('ROLLBACK');
            await client.query('ROLLBACK');
            console.error('Error completing module:', error);
            console.error('Stack:', error.stack);
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = AtomService;
