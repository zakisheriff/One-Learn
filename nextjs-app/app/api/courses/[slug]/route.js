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
        // Get modules
        const modulesResult = await query(
            `SELECT id, title, description, order_index FROM modules WHERE course_id = $1 ORDER BY order_index`,
            [course.id]
        );

        // Get all lessons for this course
        const lessonsResult = await query(
            `SELECT l.id, l.module_id, l.title, l.description, l.youtube_url, l.duration_seconds, l.order_index
             FROM lessons l
             JOIN modules m ON l.module_id = m.id
             WHERE m.course_id = $1
             ORDER BY m.order_index, l.order_index`,
            [course.id]
        );

        const modules = modulesResult.rows.map(module => {
            const moduleLessons = lessonsResult.rows.filter(l => l.module_id === module.id).map(l => ({
                id: l.id,
                title: l.title,
                description: l.description,
                youtubeUrl: l.youtube_url,
                duration: l.duration_seconds,
                moduleId: l.module_id
            }));

            return {
                id: module.id,
                title: module.title,
                description: module.description,
                lessons: moduleLessons,
                lessonCount: moduleLessons.length
            };
        });

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
