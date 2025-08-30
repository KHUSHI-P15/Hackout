const Report = require('../models/report.model');
const path = require('path');

// Get all verified reports
exports.getVerifiedReports = async (req, res) => {
	try {
		const reports = await Report.find({ status: 'verified' })
			.populate('createdBy', 'name')
			.lean();
		return res.json(reports);
	} catch (error) {
		console.error('Error fetching verified reports:', error.message, error.stack);
		return res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
	}
};

exports.resolveReport = async (req, res) => {
	console.log('---- resolveReport called ----');
	console.log('req.params:', req.params);
	console.log('req.body:', req.body);
	console.log('req.file:', req.file);

	try {
		const { responseText, govUserId, status } = req.body;

		const report = await Report.findById(req.params.id);
		if (!report) {
			return res.status(404).json({ success: false, message: 'Report not found' });
		}

		const attachment = req.file ? req.file.filename : null;

		report.status = status || 'resolved';
		report.resolvedBy = govUserId;
		report.govReplies.push({
			text: responseText,
			attachments: attachment ? [attachment] : [],
		});

		await report.save();

		res.json({ success: true, message: 'Report resolved', report });
	} catch (err) {
		console.error('resolveReport ERROR:', err);
		res.status(500).json({ success: false, error: err.message });
	}
};
