const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngo.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Route to get all reports for DataTable
router.get('/', ngoController.getAllReports);

// Route to send report to government
router.post('/send-to-government', ngoController.sendToGovernment);


// Apply authentication middleware to all NGO routes
router.use(authMiddleware(['ngo'])); // Only allow NGO users

// NGO Dashboard
router.get('/dashboard', ngoController.getNGODashboard);

// Get reports that need verification (AI confidence >= 40%)
router.get('/reports/pending', ngoController.getReportsForVerification);

// Get detailed report information for verification
router.get('/reports/:reportId', ngoController.getReportDetails);

// Verify a single report (approve/reject)
router.post('/reports/:reportId/verify', ngoController.verifyReport);

// Bulk verify multiple reports
router.post('/reports/bulk-verify', ngoController.bulkVerifyReports);

module.exports = router;
