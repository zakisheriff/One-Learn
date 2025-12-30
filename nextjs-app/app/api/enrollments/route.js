// GET /api/enrollments - Get user's enrollments
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
    try {
        const user = await verifyAuth(request);

        if (!user) {
            return Response.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Get user's enrollments with course details
        console.log('Fetching enrollments for user:', user.userId);
        const result = await query(
            `SELECT 
        e.id, e.course_id, e.enrolled_at, e.completed_at, 
        e.is_completed, e.completed_lessons,
        c.id as course_id, c.title, c.slug, c.thumbnail_url, 
        c.description, c.estimated_hours, c.instructor
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.user_id = $1
      ORDER BY e.enrolled_at DESC`,
            [user.userId]
        );

        const enrollments = result.rows.map(row => ({
            id: row.id,
            enrolledAt: row.enrolled_at,
            completedAt: row.completed_at,
            isCompleted: row.is_completed,
            progress: 0, // Calculated dynamically in future
            completedLessons: row.completed_lessons || [],
            course: {
                id: row.course_id,
                title: row.title,
                slug: row.slug,
                thumbnailUrl: row.thumbnail_url,
                description: row.description,
                estimatedHours: row.estimated_hours,
                instructor: row.instructor
            }
        }));

        return Response.json({ enrollments });

    } catch (error) {
        console.error('Get enrollments error:', error);
        return Response.json(
            { error: 'Failed to fetch enrollments' },
            { status: 500 }
        );
    }
}

// POST /api/enrollments - Enroll in a course
export async function POST(request) {
    try {
        const user = await verifyAuth(request);

        if (!user) {
            return Response.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { courseId } = await request.json();

        if (!courseId) {
            return Response.json(
                { error: 'Course ID is required' },
                { status: 400 }
            );
        }

        // Check if already enrolled
        const existingEnrollment = await query(
            'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
            [user.userId, courseId]
        );

        if (existingEnrollment.rows.length > 0) {
            return Response.json(
                { error: 'Already enrolled in this course' },
                { status: 409 }
            );
        }

        // Create enrollment
        const result = await query(
            `INSERT INTO enrollments (user_id, course_id)
       VALUES ($1, $2)
       RETURNING id, enrolled_at`,
            [user.userId, courseId]
        );

        return Response.json(
            {
                message: 'Enrolled successfully',
                enrollment: result.rows[0]
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Enrollment error:', error);
        return Response.json(
            { error: 'Failed to enroll' },
            { status: 500 }
        );
    }
}
