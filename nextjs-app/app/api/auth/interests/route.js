import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function PUT(request) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { interests } = await request.json();

        // Pass the array directly for TEXT[] column
        await query('UPDATE users SET interests = $1 WHERE id = $2', [interests, user.userId]);

        return Response.json({
            message: 'Interests updated successfully',
            interests: interests
        });
    } catch (error) {
        console.error('Update interests error:', error);
        return Response.json({ error: 'Failed to update interests' }, { status: 500 });
    }
}
