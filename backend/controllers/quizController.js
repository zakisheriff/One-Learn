// Quiz Controller - Handles quiz retrieval and submission
const pool = require('../database/connection').pool;
const { scoreQuiz, generateQuiz } = require('../services/geminiService');

/**
 * Get quiz for a course
 * GET /api/courses/:slug/quiz
 */
exports.getQuiz = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user.userId;

        // Get course
        const courseResult = await pool.query(
            'SELECT id, title FROM courses WHERE slug = $1 AND is_published = true',
            [slug]
        );

        if (courseResult.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const course = courseResult.rows[0];
        const courseId = course.id;

        // Check enrollment
        const enrollmentResult = await pool.query(
            'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
            [userId, courseId]
        );

        if (enrollmentResult.rows.length === 0) {
            return res.status(403).json({
                error: 'Not enrolled in this course'
            });
        }

        // Get quiz
        let quizResult = await pool.query(
            'SELECT id, quiz_data, passing_score FROM quizzes WHERE course_id = $1',
            [courseId]
        );

        // Check if we need to generate or upgrade the quiz
        let shouldGenerate = false;
        let existingQuizId = null;

        if (quizResult.rows.length === 0) {
            shouldGenerate = true;
        } else {
            const existingQuiz = quizResult.rows[0];
            // Upgrade if it has fewer than 10 questions
            if (existingQuiz.quiz_data.questions && existingQuiz.quiz_data.questions.length < 10) {
                console.log(`Upgrading quiz for course ${course.title} from ${existingQuiz.quiz_data.questions.length} to 10 questions.`);
                shouldGenerate = true;
                existingQuizId = existingQuiz.id;
            }
        }

        if (shouldGenerate) {
            console.log(`Generating quiz for course ${course.title}...`);

            // Get video URL from the first lesson
            // We need to join lessons -> modules -> courses
            const lessonResult = await pool.query(
                `SELECT l.youtube_url 
                 FROM lessons l
                 JOIN modules m ON l.module_id = m.id
                 WHERE m.course_id = $1
                 ORDER BY m.order_index ASC, l.order_index ASC
                 LIMIT 1`,
                [courseId]
            );

            if (lessonResult.rows.length === 0) {
                return res.status(404).json({ error: 'No content available to generate quiz' });
            }

            const videoUrl = lessonResult.rows[0].youtube_url;

            try {
                const quizData = await generateQuiz(videoUrl, course.title);

                if (existingQuizId) {
                    // Update existing quiz
                    const updateResult = await pool.query(
                        'UPDATE quizzes SET quiz_data = $1, passing_score = $2 WHERE id = $3 RETURNING id, quiz_data, passing_score',
                        [JSON.stringify(quizData), 70, existingQuizId]
                    );
                    quizResult = updateResult;
                } else {
                    // Insert new quiz
                    const insertResult = await pool.query(
                        'INSERT INTO quizzes (course_id, quiz_data, passing_score) VALUES ($1, $2, $3) RETURNING id, quiz_data, passing_score',
                        [courseId, JSON.stringify(quizData), 70]
                    );
                    quizResult = insertResult;
                }
            } catch (err) {
                console.error('Failed to generate quiz:', err);
                return res.status(500).json({ error: 'Failed to generate quiz. Please try again later.' });
            }
        }

        const quiz = quizResult.rows[0];

        // Return quiz without correct answers
        const quizForUser = {
            id: quiz.id,
            passingScore: quiz.passing_score,
            questions: quiz.quiz_data.questions.map(q => ({
                type: q.type,
                question: q.question,
                ...(q.type === 'multiple_choice' && { options: q.options })
            }))
        };

        res.json({ quiz: quizForUser });

    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({ error: 'Failed to fetch quiz' });
    }
};

/**
 * Submit quiz answers
 * POST /api/quizzes/:id/submit
 */
exports.submitQuiz = async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const { id: quizId } = req.params;
        const { answers } = req.body; // { 0: answer, 1: answer, ... }
        const userId = req.user.userId;

        if (!answers || typeof answers !== 'object') {
            return res.status(400).json({ error: 'Answers are required' });
        }

        // Get quiz
        const quizResult = await client.query(
            'SELECT id, course_id, quiz_data, passing_score FROM quizzes WHERE id = $1',
            [quizId]
        );

        if (quizResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Quiz not found' });
        }

        const quiz = quizResult.rows[0];

        // Get enrollment
        const enrollmentResult = await client.query(
            'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
            [userId, quiz.course_id]
        );

        if (enrollmentResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(403).json({ error: 'Not enrolled in this course' });
        }

        const enrollmentId = enrollmentResult.rows[0].id;

        // Score the quiz
        const result = scoreQuiz(quiz.quiz_data, answers);

        // Save quiz attempt
        const attemptResult = await client.query(
            `INSERT INTO quiz_attempts (user_id, quiz_id, enrollment_id, answers, score, passed)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, attempted_at`,
            [userId, quizId, enrollmentId, JSON.stringify(answers), result.score, result.passed]
        );

        const attempt = attemptResult.rows[0];

        // If passed, generate certificate
        let certificate = null;
        if (result.passed) {
            const certificateService = require('../services/certificateService');
            certificate = await certificateService.generateCertificate(
                userId,
                quiz.course_id,
                attempt.id,
                client
            );

            // Mark enrollment as completed
            await client.query(
                'UPDATE enrollments SET is_completed = true, completed_at = CURRENT_TIMESTAMP WHERE id = $1',
                [enrollmentId]
            );
        }

        await client.query('COMMIT');

        res.json({
            result: {
                score: result.score,
                passed: result.passed,
                correctAnswers: result.correctAnswers,
                totalQuestions: result.totalQuestions,
                details: result.details
            },
            attemptId: attempt.id,
            ...(certificate && { certificate })
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Submit quiz error:', error);
        res.status(500).json({ error: 'Failed to submit quiz', details: error.message });
    } finally {
        client.release();
    }
};
