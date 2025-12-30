import { query } from '@/lib/db';
import { verifyAuth, clearAuthCookie } from '@/lib/auth';

export async function DELETE(request) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await query('DELETE FROM users WHERE id = $1', [user.userId]);

        return Response.json(
            { message: 'Account deleted' },
            {
                status: 200,
                headers: clearAuthCookie()
            }
        );

    } catch (error) {
        console.error('Delete account error:', error);
        return Response.json({ error: 'Failed to delete account' }, { status: 500 });
    }
}
