// Course Routes
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:slug', courseController.getCourseBySlug);

// Protected routes (require authentication)
router.get('/:slug/content', authenticateToken, courseController.getCourseContent);

module.exports = router;
