const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngo.controller');

// Route to get all reports for DataTable
router.get('/', ngoController.getAllReports);

// Route to send report to government
router.post('/send-to-government', ngoController.sendToGovernment);

module.exports = router;
