// GET /api/atom/tracks - Get all Atom tracks
import { query } from '@/lib/db';

export async function GET(request) {
    try {
        const result = await query(
            `SELECT id, title, description, difficulty, estimated_hours,
              thumbnail_url, created_at
       FROM atom_tracks
       WHERE is_published = true
       ORDER BY created_at DESC`
        );

        const tracks = result.rows.map(track => ({
            id: track.id,
            title: track.title,
            description: track.description,
            difficulty: track.difficulty,
            estimatedHours: track.estimated_hours,
            thumbnailUrl: track.thumbnail_url,
            createdAt: track.created_at
        }));

        return Response.json({ tracks });

    } catch (error) {
        console.error('Get atom tracks error:', error);
        return Response.json(
            { error: 'Failed to fetch Atom tracks' },
            { status: 500 }
        );
    }
}
