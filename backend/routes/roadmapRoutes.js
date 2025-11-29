const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public route (or protected? Plan didn't specify, but usually generation is free/public or protected)
// Let's make generation protected to avoid spam, or public if we want to attract users.
// For now, let's make generation public but saving protected.
router.post('/generate', roadmapController.generateRoadmap);

// Protected routes
router.post('/save', authenticateToken, roadmapController.saveRoadmap);
router.get('/', authenticateToken, roadmapController.getUserRoadmaps);
router.delete('/:id', authenticateToken, roadmapController.deleteRoadmap);

module.exports = router;
