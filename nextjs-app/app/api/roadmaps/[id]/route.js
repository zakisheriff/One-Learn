// GET /api/roadmaps/[id] - Get roadmap details
import { query } from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { id } = params;

        // Get roadmap
        const roadmapResult = await query(
            `SELECT id, title, description, difficulty, estimated_weeks, 
              structure, created_at, thumbnail_url
       FROM roadmaps
       WHERE id = $1 AND is_published = true`,
            [id]
        );

        if (roadmapResult.rows.length === 0) {
            return Response.json(
                { error: 'Roadmap not found' },
                { status: 404 }
            );
        }

        const roadmap = roadmapResult.rows[0];

        return Response.json({
            roadmap: {
                id: roadmap.id,
                title: roadmap.title,
                description: roadmap.description,
                difficulty: roadmap.difficulty,
                estimatedWeeks: roadmap.estimated_weeks,
                structure: roadmap.structure,
                createdAt: roadmap.created_at,
                thumbnailUrl: roadmap.thumbnail_url
            }
        });

    } catch (error) {
        console.error('Get roadmap error:', error);
        return Response.json(
            { error: 'Failed to fetch roadmap' },
            { status: 500 }
        );
    }
}
