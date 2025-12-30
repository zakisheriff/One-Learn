// GET /api/verify - Public certificate verification
import { query } from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return Response.json(
                { error: 'Verification ID is required' },
                { status: 400 }
            );
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
            return Response.json(
                {
                    error: 'Certificate not found',
                    message: 'This verification ID does not match any certificate in our system.'
                },
                { status: 404 }
            );
        }

        const cert = result.rows[0];

        return Response.json({
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
        return Response.json(
            { error: 'Verification failed' },
            { status: 500 }
        );
    }
}
