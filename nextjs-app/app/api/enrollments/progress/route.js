import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request) {
    try {
        const user = await verifyAuth(request);
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { courseId, lessonId } = await request.json();

        if (!courseId || !lessonId) {
            return Response.json({ error: 'Course ID and Lesson ID are required' }, { status: 400 });
        }

        // Get current enrollment
        const result = await query(
            'SELECT completed_lessons FROM enrollments WHERE user_id = $1 AND course_id = $2',
            [user.userId, courseId]
        );

        if (result.rows.length === 0) {
            return Response.json({ error: 'Enrollment not found' }, { status: 404 });
        }

        let completedLessons = result.rows[0].completed_lessons || [];

        // Add lesson if not already completed
        if (!completedLessons.includes(lessonId)) {
            completedLessons.push(lessonId);

            await query(
                'UPDATE enrollments SET completed_lessons = $1, last_accessed_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND course_id = $3',
                [JSON.stringify(completedLessons), user.userId, courseId]
            );
        }

        return Response.json({
            message: 'Progress updated',
            completedLessons
        });

    } catch (error) {
        console.error('Update progress error:', error);
        return Response.json({ error: 'Failed to update progress' }, { status: 500 });
    }
}
