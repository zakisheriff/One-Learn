// Enrollment Controller - Handles course enrollments and progress tracking
const pool = require('../database/connection').pool;

/**
 * Enroll user in a course
 * POST /api/enrollments
 */
exports.enrollInCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.userId;

        if (!courseId) {
            return res.status(400).json({ error: 'Course ID is required' });
        }

        // Check if course exists and is published
        const courseResult = await pool.query(
            'SELECT id, title FROM courses WHERE id = $1 AND is_published = true',
            [courseId]
        );

        if (courseResult.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Check if already enrolled
        const existingEnrollment = await pool.query(
            'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
            [userId, courseId]
        );

        if (existingEnrollment.rows.length > 0) {
            return res.status(409).json({
                error: 'Already enrolled',
                enrollmentId: existingEnrollment.rows[0].id
            });
        }

        // Create enrollment
        const result = await pool.query(
            `INSERT INTO enrollments (user_id, course_id, completed_lessons)
             VALUES ($1, $2, '[]'::jsonb)
             RETURNING id, enrolled_at`,
            [userId, courseId]
        );

        res.status(201).json({
            message: 'Successfully enrolled in course',
            enrollment: {
                id: result.rows[0].id,
                courseId,
                enrolledAt: result.rows[0].enrolled_at
            }
        });

    } catch (error) {
        console.error('Enrollment error:', error);
        res.status(500).json({ error: 'Failed to enroll in course' });
    }
};

/**
 * Get user's enrollments
 * GET /api/enrollments
 */
exports.getUserEnrollments = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await pool.query(
            `SELECT 
                e.id, e.enrolled_at, e.last_accessed_at, e.is_completed,
                e.completed_lessons,
                c.id as course_id, c.slug, c.title, c.description, c.thumbnail_url,
                COUNT(DISTINCT l.id) as total_lessons
             FROM enrollments e
             JOIN courses c ON e.course_id = c.id
             LEFT JOIN modules m ON c.id = m.course_id
             LEFT JOIN lessons l ON m.id = l.module_id
             WHERE e.user_id = $1
             GROUP BY e.id, c.id
             ORDER BY e.last_accessed_at DESC`,
            [userId]
        );

        const enrollments = result.rows.map(row => {
            const completedLessons = row.completed_lessons || [];
            const totalLessons = parseInt(row.total_lessons) || 0;
            const progress = totalLessons > 0
                ? Math.round((completedLessons.length / totalLessons) * 100)
                : 0;

            return {
                id: row.id,
                enrolledAt: row.enrolled_at,
                lastAccessedAt: row.last_accessed_at,
                isCompleted: row.is_completed,
                progress,
                course: {
                    id: row.course_id,
                    slug: row.slug,
                    title: row.title,
                    description: row.description,
                    thumbnailUrl: row.thumbnail_url
                }
            };
        });

        res.json({ enrollments });

    } catch (error) {
        console.error('Get enrollments error:', error);
        res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
};

/**
 * Update lesson completion progress
 * PUT /api/enrollments/:id/progress
 */
exports.updateProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { lessonId, completed } = req.body;
        const userId = req.user.userId;

        if (!lessonId || completed === undefined) {
            return res.status(400).json({
                error: 'Lesson ID and completed status are required'
            });
        }

        // Verify enrollment belongs to user
        const enrollmentResult = await pool.query(
            'SELECT completed_lessons FROM enrollments WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (enrollmentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }

        let completedLessons = enrollmentResult.rows[0].completed_lessons || [];

        // Update completed lessons array
        if (completed && !completedLessons.includes(lessonId)) {
            completedLessons.push(lessonId);
        } else if (!completed && completedLessons.includes(lessonId)) {
            completedLessons = completedLessons.filter(id => id !== lessonId);
        }

        // Update enrollment
        await pool.query(
            `UPDATE enrollments 
             SET completed_lessons = $1, last_accessed_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [JSON.stringify(completedLessons), id]
        );

        res.json({
            message: 'Progress updated',
            completedLessons
        });

    } catch (error) {
        console.error('Update progress error:', error);
        res.status(500).json({ error: 'Failed to update progress' });
    }
};
