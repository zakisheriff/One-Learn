// Enrollments API - Vercel Serverless Function
// Handles: /api/enrollments, /api/enrollments/:id/progress

const { query } = require('../_lib/db');
const { cors, requireAuth, handleError } = require('../_lib/middleware');
const { parseBody } = require('../_lib/utils');

module.exports = async (req, res) => {
    // Handle CORS
    if (cors(req, res)) return;

    // All enrollment routes require authentication
    const user = requireAuth(req, res);
    if (!user) return;

    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathParts = url.pathname.replace('/api/enrollments', '').split('/').filter(Boolean);

        // POST /api/enrollments - Enroll in course
        if (pathParts.length === 0 && req.method === 'POST') {
            return await enrollInCourse(req, res, user);
        }

        // GET /api/enrollments - Get user enrollments
        if (pathParts.length === 0 && req.method === 'GET') {
            return await getUserEnrollments(req, res, user);
        }

        // PUT /api/enrollments/:id/progress - Update progress
        if (pathParts.length === 2 && pathParts[1] === 'progress' && req.method === 'PUT') {
            return await updateProgress(req, res, user, pathParts[0]);
        }

        res.status(404).json({ error: 'Not found' });
    } catch (error) {
        handleError(res, error);
    }
};

// Enroll in course
async function enrollInCourse(req, res, user) {
    const { courseId } = await parseBody(req);

    if (!courseId) {
        return res.status(400).json({ error: 'Course ID is required' });
    }

    // Check if already enrolled
    const existingEnrollment = await query(
        'SELECT id FROM enrollments WHERE user_id = $1 AND course_id = $2',
        [user.userId, courseId]
    );

    if (existingEnrollment.rows.length > 0) {
        return res.status(409).json({ error: 'Already enrolled in this course' });
    }

    // Create enrollment
    const result = await query(
        `INSERT INTO enrollments (user_id, course_id)
         VALUES ($1, $2)
         RETURNING id, enrolled_at`,
        [user.userId, courseId]
    );

    res.status(201).json({
        message: 'Enrolled successfully',
        enrollment: result.rows[0]
    });
}

// Get user enrollments
async function getUserEnrollments(req, res, user) {
    const result = await query(
        `SELECT e.id, e.enrolled_at, e.last_accessed_at, e.completed_lessons, e.is_completed,
                c.id as course_id, c.slug, c.title, c.description, c.thumbnail_url
         FROM enrollments e
         JOIN courses c ON c.id = e.course_id
         WHERE e.user_id = $1
         ORDER BY e.last_accessed_at DESC`,
        [user.userId]
    );

    res.json({ enrollments: result.rows });
}

// Update progress
async function updateProgress(req, res, user, enrollmentId) {
    const { lessonId, completed } = await parseBody(req);

    // Get current enrollment
    const enrollmentResult = await query(
        'SELECT completed_lessons FROM enrollments WHERE id = $1 AND user_id = $2',
        [enrollmentId, user.userId]
    );

    if (enrollmentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Enrollment not found' });
    }

    let completedLessons = enrollmentResult.rows[0].completed_lessons || [];

    if (completed && !completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId);
    } else if (!completed) {
        completedLessons = completedLessons.filter(id => id !== lessonId);
    }

    // Update enrollment
    const result = await query(
        `UPDATE enrollments
         SET completed_lessons = $1, last_accessed_at = CURRENT_TIMESTAMP
         WHERE id = $2 AND user_id = $3
         RETURNING id, completed_lessons`,
        [JSON.stringify(completedLessons), enrollmentId, user.userId]
    );

    res.json({
        message: 'Progress updated',
        completedLessons: result.rows[0].completed_lessons
    });
}
