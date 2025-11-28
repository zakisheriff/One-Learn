// Quiz Routes
const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All quiz routes require authentication
router.use(authenticateToken);

router.post('/:id/submit', quizController.submitQuiz);

module.exports = router;
