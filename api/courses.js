// Courses API - Vercel Serverless Function
// Handles: /api/courses, /api/courses/:slug, /api/courses/:slug/content, /api/courses/:slug/quiz

const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

// Database connection
let pool;
function getPool() {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            max: 1,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        });
    }
    return pool;
}

async function query(text, params) {
    const client = getPool();
    const result = await client.query(text, params);
    return result;
}

// CORS handler
function cors(req, res) {
    const origin = process.env.FRONTEND_URL || 'https://onelearn.theoneatom.com';
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Cookie');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return true;
    }
    return false;
}

// Auth middleware
function requireAuth(req, res) {
    try {
        const cookies = cookie.parse(req.headers.cookie || '');
        const token = cookies.auth_token;

        if (!token) {
            res.status(401).json({ error: 'Unauthorized', message: 'No authentication token provided' });
            return null;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
        return null;
    }
}

module.exports = async (req, res) => {
    // Handle CORS
    if (cors(req, res)) return;

    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathParts = url.pathname.replace('/api/courses', '').split('/').filter(Boolean);

        // GET /api/courses - Get all courses
        if (pathParts.length === 0 && req.method === 'GET') {
            return await getAllCourses(req, res);
        }

        // GET /api/courses/:slug - Get course by slug
        if (pathParts.length === 1 && req.method === 'GET') {
            return await getCourseBySlug(req, res, pathParts[0]);
        }

        // GET /api/courses/:slug/content - Get full course content (protected)
        if (pathParts.length === 2 && pathParts[1] === 'content' && req.method === 'GET') {
            return await getCourseContent(req, res, pathParts[0]);
        }

        // GET /api/courses/:slug/quiz - Get quiz for course (protected)
        if (pathParts.length === 2 && pathParts[1] === 'quiz' && req.method === 'GET') {
            return await getQuiz(req, res, pathParts[0]);
        }

        res.status(404).json({ error: 'Not found' });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

// Get all published courses
async function getAllCourses(req, res) {
    const result = await query(
        `SELECT id, slug, title, description, thumbnail_url, created_at
         FROM courses
         WHERE is_published = true
         ORDER BY created_at DESC`
    );

    res.json({ courses: result.rows });
}

// Get course by slug
async function getCourseBySlug(req, res, slug) {
    const result = await query(
        `SELECT id, slug, title, description, thumbnail_url, syllabus, created_at
         FROM courses
         WHERE slug = $1 AND is_published = true`,
        [slug]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ course: result.rows[0] });
}

// Get full course content with modules and lessons (protected)
async function getCourseContent(req, res, slug) {
    const user = requireAuth(req, res);
    if (!user) return;

    // Get course
    const courseResult = await query(
        `SELECT id, slug, title, description, thumbnail_url, syllabus
         FROM courses
         WHERE slug = $1 AND is_published = true`,
        [slug]
    );

    if (courseResult.rows.length === 0) {
        return res.status(404).json({ error: 'Course not found' });
    }

    const course = courseResult.rows[0];

    // Get modules with lessons
    const modulesResult = await query(
        `SELECT m.id, m.title, m.description, m.order_index,
                json_agg(
                    json_build_object(
                        'id', l.id,
                        'title', l.title,
                        'description', l.description,
                        'youtubeUrl', l.youtube_url,
                        'durationSeconds', l.duration_seconds,
                        'orderIndex', l.order_index
                    ) ORDER BY l.order_index
                ) as lessons
         FROM modules m
         LEFT JOIN lessons l ON l.module_id = m.id
         WHERE m.course_id = $1
         GROUP BY m.id, m.title, m.description, m.order_index
         ORDER BY m.order_index`,
        [course.id]
    );

    course.modules = modulesResult.rows;

    res.json({ course });
}

// Get quiz for course (protected)
async function getQuiz(req, res, slug) {
    const user = requireAuth(req, res);
    if (!user) return;

    const result = await query(
        `SELECT q.id, q.quiz_data, q.passing_score
         FROM quizzes q
         JOIN courses c ON c.id = q.course_id
         WHERE c.slug = $1`,
        [slug]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Quiz not found for this course' });
    }

    res.json({
        quiz: {
            id: result.rows[0].id,
            questions: result.rows[0].quiz_data,
            passingScore: result.rows[0].passing_score
        }
    });
}
