const express = require('express');
const router = express.Router();
const governmentController = require('../controllers/government.controller');
const { upload } = require('../utils/multer.utils'); // import multer

// resolve report (with file + text)
router.post(
	'/:id/resolve',
	upload.any(), // 👈 use any() to capture all fields
	governmentController.resolveReport
);

// other routes
router.get('/', governmentController.getVerifiedReports);

module.exports = router;
