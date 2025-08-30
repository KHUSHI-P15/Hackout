const express = require('express');
const router = express.Router();
const reportController = require('../controllers/citizens.controller');
const { asyncRouteHandler } = require('../utils/route.utils');
const { upload } = require('../utils/multer.utils');
const { authMiddleware } = require('../middleware/auth.middleware');

// Apply auth middleware to protect the route (optional - remove if you want anonymous reports)
router.use(authMiddleware('citizen'));
router.post(
	'/add-report',
	upload.array('media', 10),
	asyncRouteHandler(reportController.addReport)
);

module.exports = router;
