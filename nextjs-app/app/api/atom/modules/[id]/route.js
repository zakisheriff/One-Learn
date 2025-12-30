// GET /api/atom/modules/[id] - Get Atom module details
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request, { params }) {
    try {
        const user = await verifyAuth(request);

        if (!user) {
            return Response.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { id } = params;

        // Get module details
        const moduleResult = await query(
            `SELECT id, track_id, title, description, content_type,
              content_data, order_index, created_at
       FROM atom_modules
       WHERE id = $1`,
            [id]
        );

        if (moduleResult.rows.length === 0) {
            return Response.json(
                { error: 'Module not found' },
                { status: 404 }
            );
        }

        const module = moduleResult.rows[0];

        return Response.json({
            module: {
                id: module.id,
                trackId: module.track_id,
                title: module.title,
                description: module.description,
                contentType: module.content_type,
                contentData: module.content_data,
                orderIndex: module.order_index,
                createdAt: module.created_at
            }
        });

    } catch (error) {
        console.error('Get atom module error:', error);
        return Response.json(
            { error: 'Failed to fetch module' },
            { status: 500 }
        );
    }
}
