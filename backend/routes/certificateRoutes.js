// Certificate Routes
const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { authenticateToken } = require('../middleware/authMiddleware');

// All certificate routes require authentication
router.use(authenticateToken);

router.get('/', certificateController.getAllCertificates);
router.get('/:courseId', certificateController.getCertificate);
router.get('/:courseId/download', certificateController.downloadCertificate);

module.exports = router;
