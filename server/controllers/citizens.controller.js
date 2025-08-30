const reportsModel = require('../models/report.model');

async function addReport(req, res, next) {
	try {
		console.log('Request body:', req.body);
		console.log('Request files:', req.files);

		const { title, description, category } = req.body;

		// Parse location data (it comes as JSON string from FormData)
		let locationData;
		try {
			if (typeof req.body.location === 'string') {
				locationData = JSON.parse(req.body.location);
			} else {
				locationData = req.body.location;
			}
		} catch (err) {
			console.error('Error parsing location:', err);
			locationData = null;
		}

		// Ensure locationData has required fields
		const location = {
			lat: locationData?.lat ? parseFloat(locationData.lat) : null,
			lng: locationData?.lng ? parseFloat(locationData.lng) : null,
			address: locationData?.address || '',
		};

		// Handle media files
		const mediaPaths = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : [];

		// Get user ID from auth middleware (if available) or from request body
		const createdBy = res.locals.user?.userId || req.body.createdBy || null;

		// Create new report
		const newReport = new reportsModel({
			title,
			description,
			category,
			createdBy,
			location,
			media: mediaPaths,
		});

		await newReport.save();
		console.log('Report saved successfully:', newReport);
		res.status(201).json({ success: true, report: newReport });
	} catch (err) {
		console.error('Error creating report:', err);
		res.status(500).json({ success: false, message: 'Server error: ' + err.message });
	}
}

module.exports = { addReport };
