// POST /api/quizzes/submit - Submit quiz answers
import { query, getClient } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function POST(request) {
    const client = await getClient();

    try {
        await client.query('BEGIN');

        const user = await verifyAuth(request);

        if (!user) {
            await client.query('ROLLBACK');
            return Response.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { quizId, courseId, answers, score } = await request.json();

        // Check if enrollment is complete
        const enrollmentResult = await client.query(
            'SELECT id, is_completed FROM enrollments WHERE user_id = $1 AND course_id = $2',
            [user.userId, courseId]
        );

        if (enrollmentResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return Response.json(
                { error: 'Not enrolled in this course' },
                { status: 403 }
            );
        }

        const enrollment = enrollmentResult.rows[0];
        const passed = score >= 70; // 70% passing score

        // Record quiz attempt
        const attemptResult = await client.query(
            `INSERT INTO quiz_attempts (user_id, quiz_id, course_id, score, answers, passed)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
            [user.userId, quizId, courseId, score, JSON.stringify(answers), passed]
        );

        // If passed and not already completed, mark enrollment as complete
        if (passed && !enrollment.is_completed) {
            await client.query(
                `UPDATE enrollments 
         SET is_completed = true, completed_at = CURRENT_TIMESTAMP, progress = 100
         WHERE id = $1`,
                [enrollment.id]
            );
        }

        await client.query('COMMIT');

        return Response.json({
            message: passed ? 'Quiz passed! Congratulations!' : 'Quiz submitted. Keep trying!',
            attempt: {
                id: attemptResult.rows[0].id,
                score,
                passed,
                createdAt: attemptResult.rows[0].created_at
            },
            courseCompleted: passed && !enrollment.is_completed
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Submit quiz error:', error);
        return Response.json(
            { error: 'Failed to submit quiz' },
            { status: 500 }
        );
    } finally {
        client.release();
    }
}
