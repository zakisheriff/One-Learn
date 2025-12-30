// PUT /api/enrollments/[id]/progress - Update enrollment progress
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function PUT(request, { params }) {
    try {
        const user = await verifyAuth(request);

        if (!user) {
            return Response.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { id } = params;
        const { lessonId, progress } = await request.json();

        // Get enrollment and verify ownership
        const enrollmentResult = await query(
            'SELECT id, course_id, completed_lessons FROM enrollments WHERE id = $1 AND user_id = $2',
            [id, user.userId]
        );

        if (enrollmentResult.rows.length === 0) {
            return Response.json(
                { error: 'Enrollment not found' },
                { status: 404 }
            );
        }

        const enrollment = enrollmentResult.rows[0];
        let completedLessons = enrollment.completed_lessons || [];

        // Add lesson to completed if not already there
        if (lessonId && !completedLessons.includes(lessonId)) {
            completedLessons.push(lessonId);
        }

        // Update enrollment
        const result = await query(
            `UPDATE enrollments 
       SET completed_lessons = $1, progress = $2, last_accessed = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING id, progress, completed_lessons`,
            [JSON.stringify(completedLessons), progress || 0, id]
        );

        return Response.json({
            message: 'Progress updated',
            enrollment: result.rows[0]
        });

    } catch (error) {
        console.error('Update progress error:', error);
        return Response.json(
            { error: 'Failed to update progress' },
            { status: 500 }
        );
    }
}
