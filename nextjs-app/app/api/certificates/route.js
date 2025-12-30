// GET /api/certificates - Get user's certificates
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
    try {
        const user = await verifyAuth(request);

        if (!user) {
            return Response.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Get user's certificates
        const result = await query(
            `SELECT 
        c.id, c.verification_hash, c.course_title, c.recipient_name,
        c.completion_date, c.issued_at, c.certificate_url
      FROM certificates c
      WHERE c.user_id = $1
      ORDER BY c.issued_at DESC`,
            [user.userId]
        );

        const certificates = result.rows.map(cert => ({
            id: cert.id,
            verificationHash: cert.verification_hash,
            courseTitle: cert.course_title,
            recipientName: cert.recipient_name,
            completionDate: cert.completion_date,
            issuedAt: cert.issued_at,
            certificateUrl: cert.certificate_url
        }));

        return Response.json({ certificates });

    } catch (error) {
        console.error('Get certificates error:', error);
        return Response.json(
            { error: 'Failed to fetch certificates' },
            { status: 500 }
        );
    }
}
