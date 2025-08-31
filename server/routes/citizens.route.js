const express = require('express');
const router = express.Router();
const reportController = require('../controllers/citizens.controller');
const { asyncRouteHandler } = require('../utils/route.utils');
const { upload } = require('../utils/multer.utils');
const { authMiddleware } = require('../middleware/auth.middleware');

// For testing, make authentication optional - you can enable it later
// router.use(authMiddleware('citizen'));

// Add report route with optional authentication
router.post(
	'/add-report',
	upload.array('media', 10),
	asyncRouteHandler(reportController.addReport)
);

// Test endpoint to check AI service
router.get(
	'/test-ai',
	asyncRouteHandler(async (req, res) => {
		try {
			const MangroveAIService = require('../services/ai.service');
			const aiService = new MangroveAIService();

			const testResult = await aiService.testService();

			res.json({
				success: true,
				message: 'AI service is working',
				testResult: testResult,
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: 'AI service test failed',
				error: error.message,
			});
		}
	})
);
// Citizen fetches their own reports
router.get('/my', reportController.getMyReports);

// Get single report (detail view)
router.get('/:id', reportController.getReportById);
module.exports = router;
