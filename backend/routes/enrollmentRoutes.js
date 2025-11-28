// Enrollment Routes
const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All enrollment routes require authentication
router.use(authenticateToken);

router.post('/', enrollmentController.enrollInCourse);
router.get('/', enrollmentController.getUserEnrollments);
router.put('/:id/progress', enrollmentController.updateProgress);

module.exports = router;
