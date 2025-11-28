// Certificate Controller
const pool = require('../database/connection').pool;
const path = require('path');
const fs = require('fs');

/**
 * Get user's certificate for a course
 * GET /api/certificates/:courseId
 */
exports.getCertificate = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT id, verification_hash, recipient_name, course_title, 
                    completion_date, issued_at, pdf_path
             FROM certificates
             WHERE user_id = $1 AND course_id = $2`,
            [userId, courseId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Certificate not found',
                message: 'You have not completed this course yet'
            });
        }

        const cert = result.rows[0];

        res.json({
            certificate: {
                id: cert.id,
                verificationHash: cert.verification_hash,
                recipientName: cert.recipient_name,
                courseTitle: cert.course_title,
                completionDate: cert.completion_date,
                issuedAt: cert.issued_at,
                verificationUrl: `${process.env.FRONTEND_URL}/verify?id=${cert.verification_hash}`
            }
        });

    } catch (error) {
        console.error('Get certificate error:', error);
        res.status(500).json({ error: 'Failed to fetch certificate' });
    }
};

/**
 * Download certificate PDF
 * GET /api/certificates/:courseId/download
 */
exports.downloadCertificate = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            'SELECT pdf_path, recipient_name, course_title FROM certificates WHERE user_id = $1 AND course_id = $2',
            [userId, courseId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        const cert = result.rows[0];
        const pdfPath = cert.pdf_path;

        if (!fs.existsSync(pdfPath)) {
            return res.status(404).json({
                error: 'Certificate file not found',
                message: 'The certificate PDF is missing. Please contact support.'
            });
        }

        // Set headers for download
        const fileName = `${cert.recipient_name.replace(/\s+/g, '_')}_${cert.course_title.replace(/\s+/g, '_')}_Certificate.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        // Stream the file
        const fileStream = fs.createReadStream(pdfPath);
        fileStream.pipe(res);

    } catch (error) {
        console.error('Download certificate error:', error);
        res.status(500).json({ error: 'Failed to download certificate' });
    }
};

/**
 * Get all user's certificates
 * GET /api/certificates
 */
exports.getAllCertificates = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT c.id, c.verification_hash, c.recipient_name, c.course_title,
                    c.completion_date, c.issued_at, co.slug as course_slug
             FROM certificates c
             JOIN courses co ON c.course_id = co.id
             WHERE c.user_id = $1
             ORDER BY c.issued_at DESC`,
            [userId]
        );

        const certificates = result.rows.map(cert => ({
            id: cert.id,
            verificationHash: cert.verification_hash,
            recipientName: cert.recipient_name,
            courseTitle: cert.course_title,
            courseSlug: cert.course_slug,
            completionDate: cert.completion_date,
            issuedAt: cert.issued_at,
            verificationUrl: `${process.env.FRONTEND_URL}/verify?id=${cert.verification_hash}`
        }));

        res.json({ certificates });

    } catch (error) {
        console.error('Get certificates error:', error);
        res.status(500).json({ error: 'Failed to fetch certificates' });
    }
};
