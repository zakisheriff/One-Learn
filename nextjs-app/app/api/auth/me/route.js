// GET /api/auth/me - Get current authenticated user
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
    try {
        // Verify authentication
        const user = await verifyAuth(request);

        if (!user) {
            return Response.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Get user details from database
        const result = await query(
            'SELECT id, full_name, email, created_at, interests FROM users WHERE id = $1',
            [user.userId]
        );

        if (result.rows.length === 0) {
            return Response.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const dbUser = result.rows[0];

        return Response.json({
            user: {
                id: dbUser.id,
                fullName: dbUser.full_name,
                email: dbUser.email,
                createdAt: dbUser.created_at,
                interests: dbUser.interests || []
            }
        });

    } catch (error) {
        console.error('Get current user error:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
