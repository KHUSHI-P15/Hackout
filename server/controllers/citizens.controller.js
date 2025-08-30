const reportsModel = require('../models/report.model');
const MangroveAIService = require('../services/ai.service');

// Initialize AI service
const aiService = new MangroveAIService();

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
		let createdBy = res.locals.user?.userId || req.body.createdBy;
		
		// If no user ID, create/find an anonymous user for data consistency
		if (!createdBy) {
			const User = require('../models/user.model');
			let anonymousUser = await User.findOne({ email: 'anonymous@system.local' });
			
			if (!anonymousUser) {
				// Create anonymous user for tracking purposes
				anonymousUser = new User({
					name: 'Anonymous User',
					email: 'anonymous@system.local',
					password: 'system_generated_hash', // Won't be used for login
					phone: '0000000000', // System placeholder
					role: 'citizen',
					isActive: false, // Mark as system user
				});
				await anonymousUser.save();
				console.log('📝 Created anonymous user for report tracking');
			}
			
			createdBy = anonymousUser._id;
			console.log('⚠️ Report created by anonymous user');
		}

		// Create new report (without saving yet)
		const newReport = new reportsModel({
			title,
			description,
			category,
			createdBy,
			location,
			media: mediaPaths,
			status: 'pending', // Start as pending
			aiVerified: false, // Will be updated after AI processing
		});

		// Save the report first to get an ID
		await newReport.save();
		console.log('Report saved successfully:', newReport);

		// Process with AI if there are images
		let aiAnalysis = null;
		if (mediaPaths.length > 0) {
			try {
				console.log('🤖 Starting AI analysis for report:', newReport._id);

				// Prepare media array for AI service
				const mediaForAI = mediaPaths.map((path) => ({
					type: 'image',
					url: `${req.protocol}://${req.get('host')}${path}`,
					path: path,
				}));

				// Create report object for AI processing
				const reportForAI = {
					_id: newReport._id,
					title: newReport.title,
					description: newReport.description,
					media: mediaForAI,
				};

				// Process with AI
				aiAnalysis = await aiService.processImages(reportForAI);

				// Update report based on AI confidence
				let updatedStatus = 'pending';
				let updatedAiVerified = false;

				if (aiAnalysis.confidence >= 0.4) {
					// If confidence >= 40%, send to NGO for verification
					updatedStatus = 'pending'; // NGO will review
					updatedAiVerified = true; // AI has processed it
					console.log(
						`✅ AI confidence ${(aiAnalysis.confidence * 100).toFixed(
							1
						)}% >= 40% - Sending to NGO for verification`
					);
				} else {
					// If confidence < 40%, mark as needs more evidence
					updatedStatus = 'pending';
					updatedAiVerified = false;
					console.log(
						`⚠️ AI confidence ${(aiAnalysis.confidence * 100).toFixed(
							1
						)}% < 40% - Requires better evidence`
					);
				}

				// Update the report with AI results
				await reportsModel.findByIdAndUpdate(newReport._id, {
					status: updatedStatus,
					aiVerified: updatedAiVerified,
				});

				console.log('🎯 AI Analysis completed:', {
					reportId: newReport._id,
					confidence: `${(aiAnalysis.confidence * 100).toFixed(1)}%`,
					mangroveDetected: aiAnalysis.overallAssessment.mangroveDetected,
					recommendedAction: aiAnalysis.overallAssessment.recommendedAction,
					status: updatedStatus,
				});
			} catch (aiError) {
				console.error('❌ AI processing failed:', aiError.message);
				// Don't fail the entire request, just log the error
				// The report is still created successfully
			}
		} else {
			console.log('📷 No images provided - skipping AI analysis');
		}

		// Prepare response
		const response = {
			success: true,
			report: newReport,
			aiAnalysis: aiAnalysis
				? {
						confidence: aiAnalysis.confidence,
						mangroveDetected: aiAnalysis.overallAssessment.mangroveDetected,
						recommendedAction: aiAnalysis.overallAssessment.recommendedAction,
						needsNGOVerification: aiAnalysis.confidence >= 0.4,
				  }
				: null,
		};

		res.status(201).json(response);
	} catch (err) {
		console.error('Error creating report:', err);
		res.status(500).json({ success: false, message: 'Server error: ' + err.message });
	}
}

module.exports = { addReport };
