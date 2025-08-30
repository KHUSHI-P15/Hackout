const Report = require('../models/report.model');

exports.getAllReports = async (req, res) => {
	try {
		const reports = await Report.find({ status: 'pending' })
			.select('title category status aiVerified severity location.address media')
			.lean();
		res.status(200).json(reports);
	} catch (error) {
		console.error('Error fetching reports:', error);
		res.status(500).json({ message: 'Server error while fetching reports' });
	}
};

exports.sendToGovernment = async (req, res) => {
	const { reportId, severity } = req.body;
	const ngoId = res.locals.userId;
	try {
		const report = await Report.findById(reportId);
		if (!report) {
			return res.status(404).json({ message: 'Report not found' });
		}
		report.status = 'verified';
		report.severity = severity;
		report.verifiedBy = ngoId;

		await report.save();

		res.status(200).json({
			message: `Report "${report.title}" sent to government with severity "${severity}"`,
			report,
		});
	} catch (error) {
		console.error('Error sending report to government:', error);
		res.status(500).json({ message: 'Server error while sending report' });
	}
};
