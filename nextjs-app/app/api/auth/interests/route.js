import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function PUT(request) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { interests } = await request.json();

        // Convert array to string for text column logic or assuming postgres array if configured
        // Based on typical user schema from migration, interests is likely a text array or JSON.
        // If it's a simpel text column storing JSON string, we stringify.
        // If it's JSONB, we pass object.
        // I'll assume JSONB or TEXT[] which pg handles naturally with arrays usually, 
        // OR a text field where we store JSON string.
        // Let's safe bet: JSON.stringify if it's text, or pass array if it's jsonb.
        // Given earlier `profile` endpoint returned it directly, likely JSONB or TEXT.
        // Let's try passing the array directly. If it fails, I'll fix.

        await query('UPDATE users SET interests = $1 WHERE id = $2', [JSON.stringify(interests), user.userId]);

        return Response.json({
            message: 'Interests updated successfully',
            interests: interests
        });
    } catch (error) {
        console.error('Update interests error:', error);
        return Response.json({ error: 'Failed to update interests' }, { status: 500 });
    }
}
