// Atom Path Routes
const express = require('express');
const router = express.Router();
const atomController = require('../controllers/atomController');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');

// Public routes (or optional auth for viewing)
router.get('/tracks', atomController.getAllTracks);
router.get('/tracks/:slug', optionalAuth, atomController.getTrackBySlug);

// Protected routes (Learning flow)
router.get('/modules/:moduleId', authenticateToken, atomController.getModuleContent);
router.post('/modules/:moduleId/complete', authenticateToken, atomController.completeModule);
router.get('/tracks/:trackId/certificate', authenticateToken, atomController.getTrackCertificate);
router.get('/certificates/:id/download', atomController.downloadCertificate);
router.get('/stats', authenticateToken, atomController.getUserStats);

// Admin Routes (Should be protected by isAdmin middleware in production)
router.post('/tracks', authenticateToken, atomController.createTrack);
router.put('/tracks/:trackId', authenticateToken, atomController.updateTrack);
router.get('/tracks/:trackId', authenticateToken, atomController.getTrackById); // Add ID-based fetch
router.post('/modules', authenticateToken, atomController.createModule);
router.put('/modules/:moduleId', authenticateToken, atomController.updateModule);

module.exports = router;
