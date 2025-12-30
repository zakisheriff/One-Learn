// GET /api/courses - Get all courses
// POST /api/courses - Create a new course (admin only)
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        // Get all courses
        const result = await query(`
      SELECT 
        id, title, description, slug, category,
        instructor, estimated_hours, thumbnail_url,
        likes, views, type, subject, level, is_published, created_at
      FROM courses
      WHERE is_published = true
      ORDER BY created_at DESC
    `);

        // Transform snake_case to camelCase for frontend
        const courses = result.rows.map(course => ({
            id: course.id,
            title: course.title,
            description: course.description,
            slug: course.slug,
            category: course.category,
            instructor: course.instructor,
            estimatedHours: course.estimated_hours,
            thumbnailUrl: course.thumbnail_url, // snake_case to camelCase
            likes: course.likes,
            views: course.views,
            type: course.type,
            subject: course.subject,
            level: course.level,
            isPublished: course.is_published,
            createdAt: course.created_at
        }));

        return Response.json(courses);

    } catch (error) {
        console.error('Get courses error:', error);
        return Response.json(
            { error: 'Failed to fetch courses' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        // Verify admin authentication (you'll need to add admin check)
        const user = await verifyAuth(request);

        if (!user) {
            return Response.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const courseData = await request.json();

        const {
            title, description, slug, category, difficulty,
            instructor, estimatedHours, thumbnailUrl, videoUrl,
            tags, type, subject, level
        } = courseData;

        // Validation
        if (!title || !slug) {
            return Response.json(
                { error: 'Title and slug are required' },
                { status: 400 }
            );
        }

        // Create course
        const result = await query(
            `INSERT INTO courses (
        title, description, slug, category, difficulty,
        instructor, estimated_hours, thumbnail_url, video_url,
        tags, type, subject, level
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
            [
                title, description, slug, category, difficulty,
                instructor, estimatedHours, thumbnailUrl, videoUrl,
                tags ? JSON.stringify(tags) : null,
                type, subject, level
            ]
        );

        return Response.json(
            { message: 'Course created successfully', course: result.rows[0] },
            { status: 201 }
        );

    } catch (error) {
        console.error('Create course error:', error);
        return Response.json(
            { error: 'Failed to create course' },
            { status: 500 }
        );
    }
}
