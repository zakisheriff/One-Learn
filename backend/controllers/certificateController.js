// Certificate Controller
const pool = require('../database/connection').pool;
const path = require('path');
const fs = require('fs');
const { createCertificatePDF } = require('../services/certificateService');

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
/**
 * Download certificate PDF
 * GET /api/certificates/:courseId/download
 */
exports.downloadCertificate = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.userId;

        const result = await pool.query(
            'SELECT recipient_name, course_title, verification_hash FROM certificates WHERE user_id = $1 AND course_id = $2',
            [userId, courseId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Certificate not found' });
        }

        const cert = result.rows[0];

        // Set headers for download
        res.setHeader('Content-Type', 'application/pdf');
        const filename = `CertificateOfCompletion_${cert.course_title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        // Generate and stream PDF directly to response
        await createCertificatePDF(
            cert.recipient_name,
            cert.course_title,
            cert.verification_hash,
            res
        );

    } catch (error) {
        console.error('Download certificate error:', error);
        // If headers are already sent, we can't send a JSON error
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to download certificate' });
        }
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
            `SELECT c.id, c.verification_hash, c.recipient_name, c.course_title, c.completion_date, c.issued_at, 'course' as type, co.slug as course_slug
             FROM certificates c
             JOIN courses co ON c.course_id = co.id
             WHERE c.user_id = $1
             
             UNION ALL
             
             SELECT ac.id, ac.verification_hash, ac.recipient_name, ac.track_title as course_title, ac.completion_date, ac.issued_at, 'atom' as type, t.slug as course_slug
             FROM atom_certificates ac
             JOIN atom_tracks t ON ac.track_id = t.id
             WHERE ac.user_id = $1
             
             ORDER BY issued_at DESC`,
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
            type: cert.type,
            // Adjust verification URL based on type if needed, or use a unified one
            verificationUrl: `${process.env.FRONTEND_URL}/verify?id=${cert.verification_hash}`
        }));

        res.json({ certificates });

    } catch (error) {
        console.error('Get certificates error:', error);
        res.status(500).json({ error: 'Failed to fetch certificates' });
    }
};
