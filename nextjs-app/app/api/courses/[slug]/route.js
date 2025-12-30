// GET /api/courses/[slug] - Get course details by slug
import { query } from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { slug } = await params;

        // Get course info
        const courseResult = await query(
            `SELECT id, slug, title, description, thumbnail_url, syllabus, 
              created_at, likes, views, estimated_hours, instructor, category, level
       FROM courses
       WHERE slug = $1 AND is_published = true`,
            [slug]
        );

        if (courseResult.rows.length === 0) {
            return Response.json(
                { error: 'Course not found' },
                { status: 404 }
            );
        }

        const course = courseResult.rows[0];

        // Get modules with lesson count
        const modulesResult = await query(
            `SELECT 
        m.id, m.title, m.description, m.order_index,
        COUNT(l.id) as lesson_count
       FROM modules m
       LEFT JOIN lessons l ON m.id = l.module_id
       WHERE m.course_id = $1
       GROUP BY m.id
       ORDER BY m.order_index`,
            [course.id]
        );

        const modules = modulesResult.rows.map(module => ({
            id: module.id,
            title: module.title,
            description: module.description,
            lessonCount: parseInt(module.lesson_count) || 0
        }));

        return Response.json({
            course: {
                id: course.id,
                slug: course.slug,
                title: course.title,
                description: course.description,
                thumbnailUrl: course.thumbnail_url,
                syllabus: course.syllabus,
                modules,
                createdAt: course.created_at,
                likes: course.likes,
                views: course.views,
                estimatedHours: course.estimated_hours,
                instructor: course.instructor,
                category: course.category,
                level: course.level
            }
        });

    } catch (error) {
        console.error('Get course error:', error);
        return Response.json(
            { error: 'Failed to fetch course' },
            { status: 500 }
        );
    }
}
