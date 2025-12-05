// Atom Path Controller
const pool = require('../database/connection').pool;

/**
 * Get all published tracks
 * GET /api/atom/tracks
 */
exports.getAllTracks = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT t.*, COUNT(m.id)::int as module_count 
             FROM atom_tracks t 
             LEFT JOIN atom_modules m ON t.id = m.track_id 
             WHERE t.is_published = true 
             GROUP BY t.id 
             ORDER BY t.created_at ASC`
        );
        res.json({ tracks: result.rows });
    } catch (error) {
        console.error('Get tracks error:', error);
        res.status(500).json({ error: 'Failed to fetch tracks' });
    }
};

/**
 * Get specific track with modules
 * GET /api/atom/tracks/:slug
 */
exports.getTrackBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user ? req.user.userId : null;

        // Get track details
        const trackResult = await pool.query(
            'SELECT * FROM atom_tracks WHERE slug = $1',
            [slug]
        );

        if (trackResult.rows.length === 0) {
            return res.status(404).json({ error: 'Track not found' });
        }

        const track = trackResult.rows[0];

        // Get modules for this track
        const modulesResult = await pool.query(
            'SELECT * FROM atom_modules WHERE track_id = $1 ORDER BY order_index ASC',
            [track.id]
        );

        let modules = modulesResult.rows;

        // If user is logged in, fetch their progress
        if (userId) {
            const progressResult = await pool.query(
                'SELECT module_id, status, score FROM atom_user_progress WHERE user_id = $1 AND module_id = ANY($2)',
                [userId, modules.map(m => m.id)]
            );

            const progressMap = {};
            progressResult.rows.forEach(p => {
                progressMap[p.module_id] = p;
            });

            // Merge progress into modules
            modules = modules.map(m => ({
                ...m,
                userStatus: progressMap[m.id]?.status || 'locked',
                userScore: progressMap[m.id]?.score || null
            }));

            // Unlock logic: First module is always unlocked if not completed
            if (modules.length > 0 && modules[0].userStatus === 'locked') {
                modules[0].userStatus = 'unlocked';
            }

            // Unlock next module if previous is completed
            for (let i = 0; i < modules.length - 1; i++) {
                if (modules[i].userStatus === 'completed' && modules[i + 1].userStatus === 'locked') {
                    modules[i + 1].userStatus = 'unlocked';
                }
            }

            // Check for certificate
            const certResult = await pool.query(
                'SELECT id FROM atom_certificates WHERE user_id = $1 AND track_id = $2',
                [userId, track.id]
            );
            if (certResult.rows.length > 0) {
                track.certificate_id = certResult.rows[0].id;
            }
        }

        res.json({ track, modules });

    } catch (error) {
        console.error('Get track error:', error);
        res.status(500).json({ error: 'Failed to fetch track details' });
    }
};

/**
 * Get module content (Generic handler for all types)
 * GET /api/atom/modules/:moduleId
 */
exports.getModuleContent = async (req, res) => {
    try {
        const { moduleId } = req.params;

        // Get module info
        const moduleResult = await pool.query(
            'SELECT * FROM atom_modules WHERE id = $1',
            [moduleId]
        );

        if (moduleResult.rows.length === 0) {
            return res.status(404).json({ error: 'Module not found' });
        }

        const module = moduleResult.rows[0];
        let content = null;

        // Fetch specific content based on type
        if (module.type === 'reading') {
            const contentResult = await pool.query('SELECT content_markdown FROM atom_content_reading WHERE module_id = $1', [moduleId]);
            content = contentResult.rows[0];
        } else if (module.type === 'coding') {
            const contentResult = await pool.query(
                'SELECT title, description_markdown, language, starter_code, time_limit_ms, test_cases FROM atom_problems WHERE module_id = $1',
                [moduleId]
            );
            content = contentResult.rows[0];
            // Filter out hidden test cases for client
            if (content && content.test_cases) {
                content.test_cases = content.test_cases.filter(tc => !tc.hidden);
            }
        } else if (module.type === 'quiz') {
            const contentResult = await pool.query(
                'SELECT questions, time_limit_seconds FROM atom_quizzes WHERE module_id = $1',
                [moduleId]
            );
            content = contentResult.rows[0];
            // Remove correct answers from client response
            if (content && content.questions) {
                content.questions = content.questions.map(q => {
                    const { correct_index, ...rest } = q;
                    return rest;
                });
            }
        } else if (module.type === 'interview') {
            const contentResult = await pool.query('SELECT questions FROM atom_interviews WHERE module_id = $1', [moduleId]);
            content = contentResult.rows[0];
            // Remove keywords from client response
            if (content && content.questions) {
                content.questions = content.questions.map(q => {
                    const { required_keywords, ...rest } = q;
                    return rest;
                });
            }
        }

        res.json({ module, content });

    } catch (error) {
        console.error('Get module content error:', error);
        res.status(500).json({ error: 'Failed to fetch module content' });
    }
};

/**
 * Submit module completion
 * POST /api/atom/modules/:moduleId/complete
 */
exports.completeModule = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { score } = req.body;
        const userId = req.user.userId;

        const result = await require('../services/atomService').completeModule(userId, moduleId, score);

        res.json(result);

    } catch (error) {
        console.error('Complete module error:', error);
        res.status(500).json({ error: 'Failed to complete module' });
    }
};

/**
 * Get/Generate Certificate for Track
 * GET /api/atom/tracks/:trackId/certificate
 */
exports.getTrackCertificate = async (req, res) => {
    try {
        const { trackId } = req.params;
        const userId = req.user.userId;

        const certService = require('../services/atomCertificateService');
        const certificate = await certService.generateAtomCertificate(userId, trackId);

        res.json({ certificate });
    } catch (error) {
        console.error('Get certificate error:', error);
        res.status(500).json({ error: 'Failed to get certificate' });
    }
};

/**
 * Download Certificate PDF
 * GET /api/atom/certificates/:id/download
 */
exports.downloadCertificate = async (req, res) => {
    try {
        const { id } = req.params;
        const certService = require('../services/atomCertificateService');
        const pool = require('../database/connection').pool;

        // Get certificate details
        const result = await pool.query(
            'SELECT * FROM atom_certificates WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        const cert = result.rows[0];

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Atom_Certificate_${cert.verification_hash}.pdf"`);

        await certService.createAtomCertificatePDF(
            cert.recipient_name,
            cert.track_title,
            cert.verification_hash,
            res
        );

    } catch (error) {
        console.error('Download certificate error:', error);
        res.status(500).json({ error: 'Failed to download certificate' });
    }
};

/**
 * Get User Stats (XP, Badges, Certs)
 * GET /api/atom/stats
 */
exports.getUserStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get Total XP
        const xpResult = await pool.query(
            `SELECT COALESCE(SUM(m.xp_reward), 0)::int as total_xp
             FROM atom_user_progress up
             JOIN atom_modules m ON up.module_id = m.id
             WHERE up.user_id = $1 AND up.status = 'completed'`,
            [userId]
        );

        // Get Badges Count
        const badgesResult = await pool.query(
            'SELECT COUNT(*)::int as count FROM atom_user_badges WHERE user_id = $1',
            [userId]
        );

        // Get Certificates Count
        const certsResult = await pool.query(
            'SELECT COUNT(*)::int as count FROM atom_certificates WHERE user_id = $1',
            [userId]
        );

        res.json({
            xp: xpResult.rows[0].total_xp,
            badges: badgesResult.rows[0].count,
            certificates: certsResult.rows[0].count
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
};

// --- Admin Endpoints ---

/**
 * Create a new track
 * POST /api/atom/tracks
 */
exports.createTrack = async (req, res) => {
    try {
        const { title, slug, description, difficulty, is_published } = req.body;
        const result = await pool.query(
            `INSERT INTO atom_tracks (title, slug, description, difficulty, is_published)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [title, slug, description, difficulty, is_published]
        );
        res.status(201).json({ track: result.rows[0] });
    } catch (error) {
        console.error('Create track error:', error);
        res.status(500).json({ error: 'Failed to create track' });
    }
};

/**
 * Update a track
 * PUT /api/atom/tracks/:trackId
 */
exports.updateTrack = async (req, res) => {
    try {
        const { trackId } = req.params;
        const { title, slug, description, difficulty, is_published } = req.body;
        const result = await pool.query(
            `UPDATE atom_tracks 
             SET title = $1, slug = $2, description = $3, difficulty = $4, is_published = $5, updated_at = NOW()
             WHERE id = $6
             RETURNING *`,
            [title, slug, description, difficulty, is_published, trackId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Track not found' });
        res.json({ track: result.rows[0] });
    } catch (error) {
        console.error('Update track error:', error);
        res.status(500).json({ error: 'Failed to update track' });
    }
};

/**
 * Get track by ID (Admin)
 * GET /api/atom/tracks/:trackId
 */
exports.getTrackById = async (req, res) => {
    try {
        const { trackId } = req.params;
        const result = await pool.query('SELECT * FROM atom_tracks WHERE id = $1', [trackId]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Track not found' });
        res.json({ track: result.rows[0] });
    } catch (error) {
        console.error('Get track error:', error);
        res.status(500).json({ error: 'Failed to get track' });
    }
};

/**
 * Create a module
 * POST /api/atom/modules
 */
exports.createModule = async (req, res) => {
    try {
        const { track_id, title, type, order_index, xp_reward } = req.body;
        const result = await pool.query(
            `INSERT INTO atom_modules (track_id, title, type, order_index, xp_reward)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [track_id, title, type, order_index, xp_reward]
        );
        res.status(201).json({ module: result.rows[0] });
    } catch (error) {
        console.error('Create module error:', error);
        res.status(500).json({ error: 'Failed to create module' });
    }
};

/**
 * Update a module
 * PUT /api/atom/modules/:moduleId
 */
exports.updateModule = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const { title, type, order_index, xp_reward } = req.body;
        const result = await pool.query(
            `UPDATE atom_modules 
             SET title = $1, type = $2, order_index = $3, xp_reward = $4
             WHERE id = $5
             RETURNING *`,
            [title, type, order_index, xp_reward, moduleId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Module not found' });
        res.json({ module: result.rows[0] });
    } catch (error) {
        console.error('Update module error:', error);
        res.status(500).json({ error: 'Failed to update module' });
    }
};
