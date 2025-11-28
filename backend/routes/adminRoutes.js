// Admin Routes - Internal endpoints for course management
const express = require('express');
const router = express.Router();
const { generateQuiz } = require('../services/geminiService');
const pool = require('../database/connection').pool;
const { authenticateToken } = require('../middleware/authMiddleware');

// Simple admin check (in production, use proper role-based access control)
const isAdmin = (req, res, next) => {
    // For now, check if user email contains 'admin'
    // In production, implement proper role system in database
    if (req.user && req.user.email && req.user.email.includes('admin')) {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
};

/**
 * Generate quiz for a course using Gemini AI
 * POST /api/admin/generate-quiz
 * Body: { courseId, videoUrls }
 */
router.post('/generate-quiz', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { courseId, videoUrls } = req.body;

        if (!courseId || !videoUrls) {
            return res.status(400).json({
                error: 'Course ID and video URLs are required'
            });
        }

        // Get course info
        const courseResult = await pool.query(
            'SELECT id, title FROM courses WHERE id = $1',
            [courseId]
        );

        if (courseResult.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const course = courseResult.rows[0];

        // Generate quiz using Gemini
        console.log(`Generating quiz for course: ${course.title}`);
        const quizData = await generateQuiz(videoUrls, course.title);

        // Check if quiz already exists
        const existingQuiz = await pool.query(
            'SELECT id FROM quizzes WHERE course_id = $1',
            [courseId]
        );

        let result;
        if (existingQuiz.rows.length > 0) {
            // Update existing quiz
            result = await pool.query(
                `UPDATE quizzes 
                 SET quiz_data = $1, updated_at = CURRENT_TIMESTAMP
                 WHERE course_id = $2
                 RETURNING id`,
                [JSON.stringify(quizData), courseId]
            );
            console.log(`Updated quiz for course: ${course.title}`);
        } else {
            // Create new quiz
            result = await pool.query(
                `INSERT INTO quizzes (course_id, quiz_data)
                 VALUES ($1, $2)
                 RETURNING id`,
                [courseId, JSON.stringify(quizData)]
            );
            console.log(`Created quiz for course: ${course.title}`);
        }

        res.json({
            message: 'Quiz generated successfully',
            quizId: result.rows[0].id,
            questionCount: quizData.questions.length
        });

    } catch (error) {
        console.error('Generate quiz error:', error);
        res.status(500).json({
            error: 'Failed to generate quiz',
            message: error.message
        });
    }
});

/**
 * Create a new course
 * POST /api/admin/courses
 */
router.post('/courses', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { slug, title, description, thumbnailUrl, syllabus, modules } = req.body;

        if (!slug || !title || !description) {
            return res.status(400).json({
                error: 'Slug, title, and description are required'
            });
        }

        // Create course
        const courseResult = await pool.query(
            `INSERT INTO courses (slug, title, description, thumbnail_url, syllabus, is_published)
             VALUES ($1, $2, $3, $4, $5, false)
             RETURNING id`,
            [slug, title, description, thumbnailUrl || null, syllabus || null]
        );

        const courseId = courseResult.rows[0].id;

        // Create modules and lessons if provided
        if (modules && Array.isArray(modules)) {
            for (let i = 0; i < modules.length; i++) {
                const module = modules[i];

                const moduleResult = await pool.query(
                    `INSERT INTO modules (course_id, title, description, order_index)
                     VALUES ($1, $2, $3, $4)
                     RETURNING id`,
                    [courseId, module.title, module.description || null, i]
                );

                const moduleId = moduleResult.rows[0].id;

                // Create lessons
                if (module.lessons && Array.isArray(module.lessons)) {
                    for (let j = 0; j < module.lessons.length; j++) {
                        const lesson = module.lessons[j];

                        await pool.query(
                            `INSERT INTO lessons (module_id, title, description, youtube_url, duration_seconds, order_index)
                             VALUES ($1, $2, $3, $4, $5, $6)`,
                            [
                                moduleId,
                                lesson.title,
                                lesson.description || null,
                                lesson.youtubeUrl,
                                lesson.duration || null,
                                j
                            ]
                        );
                    }
                }
            }
        }

        res.status(201).json({
            message: 'Course created successfully',
            courseId
        });

    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ error: 'Failed to create course' });
    }
});

/**
 * Publish/unpublish a course
 * PATCH /api/admin/courses/:id/publish
 */
router.patch('/courses/:id/publish', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { published } = req.body;

        await pool.query(
            'UPDATE courses SET is_published = $1 WHERE id = $2',
            [published, id]
        );

        res.json({
            message: `Course ${published ? 'published' : 'unpublished'} successfully`
        });

    } catch (error) {
        console.error('Publish course error:', error);
        res.status(500).json({ error: 'Failed to update course' });
    }
});

module.exports = router;
