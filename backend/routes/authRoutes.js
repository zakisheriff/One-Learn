// Authentication Routes
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/google', authController.googleAuth);

// Protected routes
router.post('/logout', authController.logout);
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;
