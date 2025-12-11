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
router.put('/profile', authenticateToken, authController.updateProfile);
router.put('/password', authenticateToken, authController.updatePassword);
router.put('/interests', authenticateToken, authController.updateInterests);
router.delete('/account', authenticateToken, authController.deleteAccount);

module.exports = router;
