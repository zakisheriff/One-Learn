// Certificates API - Vercel Serverless Function
// Handles: /api/certificates, /api/certificates/:courseId, /api/certificates/:courseId/download

const crypto = require('crypto');
const { query } = require('../_lib/db');
const { cors, requireAuth, handleError } = require('../_lib/middleware');

module.exports = async (req, res) => {
    // Handle CORS
    if (cors(req, res)) return;

    // All certificate routes require authentication
    const user = requireAuth(req, res);
    if (!user) return;

    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathParts = url.pathname.replace('/api/certificates', '').split('/').filter(Boolean);

        // GET /api/certificates - Get all user certificates
        if (pathParts.length === 0 && req.method === 'GET') {
            return await getAllCertificates(req, res, user);
        }

        // GET /api/certificates/:courseId - Get certificate for course
        if (pathParts.length === 1 && req.method === 'GET') {
            return await getCertificate(req, res, user, pathParts[0]);
        }

        // GET /api/certificates/:courseId/download - Download certificate PDF
        if (pathParts.length === 2 && pathParts[1] === 'download' && req.method === 'GET') {
            return await downloadCertificate(req, res, user, pathParts[0]);
        }

        res.status(404).json({ error: 'Not found' });
    } catch (error) {
        handleError(res, error);
    }
};

// Get all user certificates
async function getAllCertificates(req, res, user) {
    const result = await query(
        `SELECT c.id, c.course_id, c.recipient_name, c.course_title, 
                c.completion_date, c.verification_hash, c.issued_at,
                co.slug as course_slug
         FROM certificates c
         JOIN courses co ON co.id = c.course_id
         WHERE c.user_id = $1
         ORDER BY c.issued_at DESC`,
        [user.userId]
    );

    res.json({ certificates: result.rows });
}

// Get certificate for specific course
async function getCertificate(req, res, user, courseId) {
    const result = await query(
        `SELECT c.id, c.course_id, c.recipient_name, c.course_title,
                c.completion_date, c.verification_hash, c.issued_at,
                co.slug as course_slug
         FROM certificates c
         JOIN courses co ON co.id = c.course_id
         WHERE c.user_id = $1 AND c.course_id = $2`,
        [user.userId, courseId]
    );

    if (result.rows.length === 0) {
        // Check if user passed the quiz but certificate not generated yet
        const quizResult = await query(
            `SELECT qa.id, qa.score, qa.passed, qa.attempted_at,
                    u.full_name, co.title as course_title
             FROM quiz_attempts qa
             JOIN quizzes q ON q.id = qa.quiz_id
             JOIN courses co ON co.id = q.course_id
             JOIN users u ON u.id = qa.user_id
             WHERE qa.user_id = $1 AND q.course_id = $2 AND qa.passed = true
             ORDER BY qa.attempted_at DESC
             LIMIT 1`,
            [user.userId, courseId]
        );

        if (quizResult.rows.length > 0) {
            // Generate certificate
            const quizAttempt = quizResult.rows[0];
            const verificationHash = crypto.createHash('sha256')
                .update(`${user.userId}-${courseId}-${Date.now()}`)
                .digest('hex');

            const certResult = await query(
                `INSERT INTO certificates (user_id, course_id, quiz_attempt_id, recipient_name, course_title, verification_hash)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING id, course_id, recipient_name, course_title, completion_date, verification_hash, issued_at`,
                [user.userId, courseId, quizAttempt.id, quizAttempt.full_name, quizAttempt.course_title, verificationHash]
            );

            return res.json({ certificate: certResult.rows[0] });
        }

        return res.status(404).json({ error: 'Certificate not found. Complete and pass the quiz first.' });
    }

    res.json({ certificate: result.rows[0] });
}

// Download certificate PDF
async function downloadCertificate(req, res, user, courseId) {
    const result = await query(
        `SELECT c.id, c.recipient_name, c.course_title, c.completion_date, c.verification_hash
         FROM certificates c
         WHERE c.user_id = $1 AND c.course_id = $2`,
        [user.userId, courseId]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Certificate not found' });
    }

    const cert = result.rows[0];

    // For now, return certificate data as JSON
    // In production, you would generate a PDF here using PDFKit
    // Due to serverless limitations, consider using a separate service or pre-generated PDFs

    res.json({
        message: 'Certificate data',
        certificate: {
            recipientName: cert.recipient_name,
            courseTitle: cert.course_title,
            completionDate: cert.completion_date,
            verificationHash: cert.verification_hash,
            verificationUrl: `${process.env.FRONTEND_URL}/verify?id=${cert.verification_hash}`
        }
    });
}
