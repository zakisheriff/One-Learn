// GET /api/roadmaps - Get all roadmaps
import { query } from '@/lib/db';

export async function GET(request) {
    try {
        const result = await query(
            `SELECT id, title, description, difficulty, estimated_weeks, 
              created_at, thumbnail_url
       FROM roadmaps
       WHERE is_published = true
       ORDER BY created_at DESC`
        );

        const roadmaps = result.rows.map(roadmap => ({
            id: roadmap.id,
            title: roadmap.title,
            description: roadmap.description,
            difficulty: roadmap.difficulty,
            estimatedWeeks: roadmap.estimated_weeks,
            createdAt: roadmap.created_at,
            thumbnailUrl: roadmap.thumbnail_url
        }));

        return Response.json({ roadmaps });

    } catch (error) {
        console.error('Get roadmaps error:', error);
        return Response.json(
            { error: 'Failed to fetch roadmaps' },
            { status: 500 }
        );
    }
}
