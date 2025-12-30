// GET /api/quizzes/[courseId] - Get quiz for a course
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

        const { courseId } = params;

        // Get most recent quiz for the course
        const result = await query(
            `SELECT id, questions, created_at
       FROM quizzes
       WHERE course_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
            [courseId]
        );

        if (result.rows.length === 0) {
            return Response.json(
                { error: 'No quiz found for this course' },
                { status: 404 }
            );
        }

        const quiz = result.rows[0];

        return Response.json({
            quiz: {
                id: quiz.id,
                courseId,
                questions: quiz.questions,
                createdAt: quiz.created_at
            }
        });

    } catch (error) {
        console.error('Get quiz error:', error);
        return Response.json(
            { error: 'Failed to fetch quiz' },
            { status: 500 }
        );
    }
}
