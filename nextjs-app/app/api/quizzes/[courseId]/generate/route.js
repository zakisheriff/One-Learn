// POST /api/quizzes/[courseId]/generate - Generate quiz for a course
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import { generateQuiz } from '@/lib/gemini';

export async function POST(request, { params }) {
    try {
        const user = await verifyAuth(request);

        if (!user) {
            return Response.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { courseId } = params;

        // Get course and lessons
        const courseResult = await query(
            'SELECT id, title FROM courses WHERE id = $1',
            [courseId]
        );

        if (courseResult.rows.length === 0) {
            return Response.json(
                { error: 'Course not found' },
                { status: 404 }
            );
        }

        const course = courseResult.rows[0];

        // Get lesson titles for context
        const lessonsResult = await query(
            `SELECT l.title 
       FROM lessons l
       JOIN modules m ON l.module_id = m.id
       WHERE m.course_id = $1
       ORDER BY m.order_index, l.order_index
       LIMIT 20`,
            [courseId]
        );

        const lessonTitles = lessonsResult.rows.map(l => l.title);

        // Generate quiz using Gemini AI
        const questions = await generateQuiz(course.title, lessonTitles);

        // Store quiz in database
        const quizResult = await query(
            `INSERT INTO quizzes (course_id, questions, created_by)
       VALUES ($1, $2, $3)
       RETURNING id, created_at`,
            [courseId, JSON.stringify(questions), user.userId]
        );

        return Response.json({
            message: 'Quiz generated successfully',
            quiz: {
                id: quizResult.rows[0].id,
                courseId,
                questions,
                createdAt: quizResult.rows[0].created_at
            }
        });

    } catch (error) {
        console.error('Generate quiz error:', error);
        return Response.json(
            { error: 'Failed to generate quiz', details: error.message },
            { status: 500 }
        );
    }
}
