// Quizzes API - Vercel Serverless Function
// Handles: /api/quizzes/:id/submit

const { query } = require('../_lib/db');
const { cors, requireAuth, handleError } = require('../_lib/middleware');
const { parseBody } = require('../_lib/utils');

module.exports = async (req, res) => {
    // Handle CORS
    if (cors(req, res)) return;

    // All quiz routes require authentication
    const user = requireAuth(req, res);
    if (!user) return;

    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathParts = url.pathname.replace('/api/quizzes', '').split('/').filter(Boolean);

        // POST /api/quizzes/:id/submit - Submit quiz
        if (pathParts.length === 2 && pathParts[1] === 'submit' && req.method === 'POST') {
            return await submitQuiz(req, res, user, pathParts[0]);
        }

        res.status(404).json({ error: 'Not found' });
    } catch (error) {
        handleError(res, error);
    }
};

// Submit quiz
async function submitQuiz(req, res, user, quizId) {
    const { answers } = await parseBody(req);

    if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: 'Answers array is required' });
    }

    // Get quiz
    const quizResult = await query(
        'SELECT id, course_id, quiz_data, passing_score FROM quizzes WHERE id = $1',
        [quizId]
    );

    if (quizResult.rows.length === 0) {
        return res.status(404).json({ error: 'Quiz not found' });
    }

    const quiz = quizResult.rows[0];
    const questions = quiz.quiz_data;

    // Get enrollment
    const enrollmentResult = await query(
        'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
        [user.userId, quiz.course_id]
    );

    if (enrollmentResult.rows.length === 0) {
        return res.status(403).json({ error: 'Not enrolled in this course' });
    }

    const enrollmentId = enrollmentResult.rows[0].id;

    // Calculate score
    let correctCount = 0;
    const results = [];

    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const userAnswer = answers[i];
        let isCorrect = false;

        if (question.type === 'multiple-choice') {
            isCorrect = userAnswer === question.correctAnswer;
        } else if (question.type === 'true-false') {
            isCorrect = userAnswer === question.correctAnswer;
        } else if (question.type === 'fill-in-the-blank') {
            // Case-insensitive comparison
            isCorrect = userAnswer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();
        }

        if (isCorrect) correctCount++;

        results.push({
            questionIndex: i,
            userAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect
        });
    }

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= quiz.passing_score;

    // Save quiz attempt
    const attemptResult = await query(
        `INSERT INTO quiz_attempts (user_id, quiz_id, enrollment_id, answers, score, passed)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, attempted_at`,
        [user.userId, quizId, enrollmentId, JSON.stringify(answers), score, passed]
    );

    const attempt = attemptResult.rows[0];

    // If passed, mark enrollment as completed
    if (passed) {
        await query(
            `UPDATE enrollments
             SET is_completed = true, completed_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [enrollmentId]
        );
    }

    res.json({
        attemptId: attempt.id,
        score,
        passed,
        passingScore: quiz.passing_score,
        results,
        attemptedAt: attempt.attempted_at
    });
}
