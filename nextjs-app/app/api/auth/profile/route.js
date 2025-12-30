import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function PUT(request) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fullName, email } = await request.json();

        // Check if email is taken (if changed)
        if (email !== user.email) {
            const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
            if (existing.rows.length > 0) {
                return Response.json({ error: 'Email already in use' }, { status: 400 });
            }
        }

        const result = await query(
            'UPDATE users SET full_name = $1, email = $2 WHERE id = $3 RETURNING id, full_name, email, interests',
            [fullName, email, user.userId]
        );

        return Response.json({
            message: 'Profile updated',
            user: {
                id: result.rows[0].id,
                fullName: result.rows[0].full_name,
                email: result.rows[0].email,
                interests: result.rows[0].interests
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        return Response.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
