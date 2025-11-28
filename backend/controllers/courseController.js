// Course Controller - Handles course catalog and content delivery
const pool = require('../database/connection').pool;

/**
 * Get all published courses (Public)
 * GET /api/courses
 */
exports.getAllCourses = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                c.id, c.slug, c.title, c.description, c.thumbnail_url,
                COUNT(DISTINCT m.id) as module_count,
                COUNT(DISTINCT l.id) as lesson_count,
                SUM(l.duration_seconds) as total_duration_seconds
             FROM courses c
             LEFT JOIN modules m ON c.id = m.course_id
             LEFT JOIN lessons l ON m.id = l.module_id
             WHERE c.is_published = true
             GROUP BY c.id
             ORDER BY c.created_at DESC`
        );

        const courses = result.rows.map(course => ({
            id: course.id,
            slug: course.slug,
            title: course.title,
            description: course.description,
            thumbnailUrl: course.thumbnail_url,
            moduleCount: parseInt(course.module_count) || 0,
            lessonCount: parseInt(course.lesson_count) || 0,
            duration: formatDuration(course.total_duration_seconds)
        }));

        res.json({ courses });

    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({
            error: 'Failed to fetch courses',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * Get course details by slug (Public - shows syllabus only)
 * GET /api/courses/:slug
 */
exports.getCourseBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        // Get course info
        const courseResult = await pool.query(
            `SELECT id, slug, title, description, thumbnail_url, syllabus, created_at
             FROM courses
             WHERE slug = $1 AND is_published = true`,
            [slug]
        );

        if (courseResult.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const course = courseResult.rows[0];

        // Get modules with lesson count (no YouTube URLs)
        const modulesResult = await pool.query(
            `SELECT 
                m.id, m.title, m.description, m.order_index,
                COUNT(l.id) as lesson_count
             FROM modules m
             LEFT JOIN lessons l ON m.id = l.module_id
             WHERE m.course_id = $1
             GROUP BY m.id
             ORDER BY m.order_index`,
            [course.id]
        );

        const modules = modulesResult.rows.map(module => ({
            id: module.id,
            title: module.title,
            description: module.description,
            lessonCount: parseInt(module.lesson_count) || 0
        }));

        res.json({
            course: {
                id: course.id,
                slug: course.slug,
                title: course.title,
                description: course.description,
                thumbnailUrl: course.thumbnail_url,
                syllabus: course.syllabus,
                modules,
                createdAt: course.created_at
            }
        });

    } catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ error: 'Failed to fetch course' });
    }
};

/**
 * Get full course content with video URLs (Protected - requires authentication)
 * GET /api/courses/:slug/content
 */
exports.getCourseContent = async (req, res) => {
    try {
        const { slug } = req.params;
        const userId = req.user.userId;

        // Get course
        const courseResult = await pool.query(
            'SELECT id, title, description, thumbnail_url FROM courses WHERE slug = $1 AND is_published = true',
            [slug]
        );

        if (courseResult.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const course = courseResult.rows[0];

        // Check if user is enrolled
        const enrollmentResult = await pool.query(
            'SELECT id, completed_lessons FROM enrollments WHERE user_id = $1 AND course_id = $2',
            [userId, course.id]
        );

        if (enrollmentResult.rows.length === 0) {
            return res.status(403).json({
                error: 'Not enrolled',
                message: 'You must enroll in this course to access the content'
            });
        }

        const enrollment = enrollmentResult.rows[0];
        const completedLessons = enrollment.completed_lessons || [];

        // Get full course structure with YouTube URLs
        const modulesResult = await pool.query(
            `SELECT id, title, description, order_index
             FROM modules
             WHERE course_id = $1
             ORDER BY order_index`,
            [course.id]
        );

        const modules = await Promise.all(modulesResult.rows.map(async (module) => {
            const lessonsResult = await pool.query(
                `SELECT id, title, description, youtube_url, duration_seconds, order_index
                 FROM lessons
                 WHERE module_id = $1
                 ORDER BY order_index`,
                [module.id]
            );

            const lessons = lessonsResult.rows.map(lesson => ({
                id: lesson.id,
                title: lesson.title,
                description: lesson.description,
                youtubeUrl: lesson.youtube_url,
                duration: lesson.duration_seconds,
                completed: completedLessons.includes(lesson.id)
            }));

            return {
                id: module.id,
                title: module.title,
                description: module.description,
                lessons
            };
        }));

        res.json({
            course: {
                id: course.id,
                title: course.title,
                description: course.description,
                thumbnailUrl: course.thumbnail_url,
                modules
            },
            enrollmentId: enrollment.id
        });

    } catch (error) {
        console.error('Get course content error:', error);
        res.status(500).json({ error: 'Failed to fetch course content' });
    }
};

// Helper function to format duration
function formatDuration(seconds) {
    if (!seconds) return null;

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}
