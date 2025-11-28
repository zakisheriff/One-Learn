// Course Routes
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const quizController = require('../controllers/quizController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.get('/', courseController.getAllCourses);
router.get('/:slug', courseController.getCourseBySlug);

// Protected routes (require authentication)
router.get('/:slug/content', authenticateToken, courseController.getCourseContent);
router.get('/:slug/quiz', authenticateToken, quizController.getQuiz);

module.exports = router;
