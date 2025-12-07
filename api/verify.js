// Certificate Verification API - Vercel Serverless Function
// Public endpoint: /api/verify?id=hash

const { query } = require('./_lib/db');
const { cors, handleError } = require('./_lib/middleware');
const { getQueryParams } = require('./_lib/utils');

module.exports = async (req, res) => {
    // Handle CORS
    if (cors(req, res)) return;

    try {
        const { id } = getQueryParams(req);

        if (!id) {
            return res.status(400).json({ error: 'Verification ID is required' });
        }

        const result = await query(
            `SELECT recipient_name, course_title, completion_date, issued_at, 'course' as type
             FROM certificates
             WHERE verification_hash = $1
             
             UNION ALL
             
             SELECT recipient_name, track_title as course_title, completion_date, issued_at, 'atom' as type
             FROM atom_certificates
             WHERE verification_hash = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Certificate not found',
                message: 'This verification ID does not match any certificate in our system.'
            });
        }

        const cert = result.rows[0];

        res.json({
            valid: true,
            certificate: {
                recipientName: cert.recipient_name,
                courseTitle: cert.course_title,
                completionDate: cert.completion_date,
                issuedAt: cert.issued_at,
                organization: 'The One Atom'
            }
        });

    } catch (error) {
        console.error('Certificate verification error:', error);
        handleError(res, error);
    }
};
