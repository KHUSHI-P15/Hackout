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
	console.log('req.files:', req.files);
	console.log('req.headers:', req.headers);
	console.log('req.method:', req.method);

	// Check if req.body is undefined and handle it
	if (!req.body) {
		console.log('⚠️ req.body is undefined');
		return res.status(400).json({ 
			success: false, 
			message: 'Request body is undefined. Check content-type and multer configuration.' 
		});
	}

	try {
		const { responseText, resolvedBy, status } = req.body;

		if (!responseText) {
			return res.status(400).json({ 
				success: false, 
				message: 'responseText is required' 
			});
		}

		const report = await Report.findById(req.params.id);
		if (!report) {
			return res.status(404).json({ success: false, message: 'Report not found' });
		}

		// Handle file from any() upload - files are in an array
		const responseFile = req.files && req.files.find(file => file.fieldname === 'responseFile');
		const attachment = responseFile ? responseFile.filename : null;

		report.status = status || 'resolved';
		report.resolvedBy = resolvedBy;
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
