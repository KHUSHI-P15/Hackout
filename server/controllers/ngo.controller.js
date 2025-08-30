const Report = require('../models/report.model');
const reportsModel = require('../models/report.model');
const AIValidation = require('../models/aiValidation.model');
const MangroveAIService = require('../services/ai.service');

// Initialize AI service
const aiService = new MangroveAIService();

async function getAllReports(req, res){
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

async function sendToGovernment(req, res){
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



/**
 * Get all reports that need NGO verification
 * (AI confidence >= 40% and status = 'pending')
 */
async function getReportsForVerification(req, res) {
	try {
		// Get reports that have been processed by AI with confidence >= 40%
		const reportsNeedingVerification = await reportsModel
			.find({
				status: 'pending',
				aiVerified: true, // AI has processed it
				media: { $exists: true, $not: { $size: 0 } }, // Has images
			})
			.populate('createdBy', 'name email')
			.sort({ createdAt: -1 });

		// Get AI validation data for each report
		const reportsWithAI = await Promise.all(
			reportsNeedingVerification.map(async (report) => {
				const aiValidation = await AIValidation.findOne({
					report: report._id,
					isActive: true,
				});

				return {
					...report.toObject(),
					aiValidation: aiValidation || null,
				};
			})
		);

		// Filter reports with confidence >= 40%
		const filteredReports = reportsWithAI.filter((report) => {
			return report.aiValidation && report.aiValidation.confidence >= 40;
		});

		res.status(200).json({
			success: true,
			count: filteredReports.length,
			reports: filteredReports,
		});
	} catch (error) {
		console.error('Error fetching reports for verification:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch reports for verification',
		});
	}
}

/**
 * Verify a report (approve or reject)
 */
async function verifyReport(req, res) {
	try {
		const { reportId } = req.params;
		const { decision, comments, severity } = req.body; // decision: 'approved' | 'rejected'
		const ngoUserId = res.locals.user?.userId;

		if (!ngoUserId) {
			return res.status(401).json({
				success: false,
				message: 'NGO user authentication required',
			});
		}

		if (!['approved', 'rejected'].includes(decision)) {
			return res.status(400).json({
				success: false,
				message: 'Decision must be either "approved" or "rejected"',
			});
		}

		// Find the report
		const report = await reportsModel.findById(reportId);
		if (!report) {
			return res.status(404).json({
				success: false,
				message: 'Report not found',
			});
		}

		// Get AI validation data
		const aiValidation = await AIValidation.findOne({
			report: reportId,
			isActive: true,
		});

		// Update report status based on NGO decision
		const updateData = {
			verifiedBy: ngoUserId,
			status: decision === 'approved' ? 'verified' : 'rejected',
		};

		// If approved and severity is provided, update severity
		if (decision === 'approved' && severity) {
			updateData.severity = severity;
		}

		await reportsModel.findByIdAndUpdate(reportId, updateData);

		// Update AI validation with human feedback
		if (aiValidation) {
			try {
				await aiService.updateWithHumanFeedback(
					reportId,
					{
						isMangrove: decision === 'approved',
						confidenceRating: req.body.confidenceRating || null,
						comments: comments || null,
					},
					ngoUserId
				);
			} catch (aiError) {
				console.error('Failed to update AI with human feedback:', aiError);
				// Don't fail the entire request
			}
		}

		// Get updated report
		const updatedReport = await reportsModel
			.findById(reportId)
			.populate('createdBy', 'name email')
			.populate('verifiedBy', 'name email');

		console.log(`✅ Report ${reportId} ${decision} by NGO user ${ngoUserId}`);

		res.status(200).json({
			success: true,
			message: `Report ${decision} successfully`,
			report: updatedReport,
		});
	} catch (error) {
		console.error('Error verifying report:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to verify report',
		});
	}
}

/**
 * Get NGO dashboard statistics
 */
async function getNGODashboard(req, res) {
	try {
		const ngoUserId = res.locals.user?.userId;

		// Get statistics
		const stats = await Promise.all([
			// Total reports pending verification
			reportsModel.countDocuments({
				status: 'pending',
				aiVerified: true,
			}),
			// Reports verified by this NGO
			reportsModel.countDocuments({
				verifiedBy: ngoUserId,
			}),
			// Reports approved by this NGO
			reportsModel.countDocuments({
				verifiedBy: ngoUserId,
				status: 'verified',
			}),
			// Reports rejected by this NGO
			reportsModel.countDocuments({
				verifiedBy: ngoUserId,
				status: 'rejected',
			}),
		]);

		// Get AI performance stats
		let aiStats = null;
		try {
			aiStats = await aiService.getPerformanceStats();
		} catch (error) {
			console.error('Failed to get AI stats:', error);
		}

		// Get recent activity
		const recentReports = await reportsModel
			.find({
				$or: [
					{ status: 'pending', aiVerified: true },
					{ verifiedBy: ngoUserId },
				],
			})
			.populate('createdBy', 'name email')
			.populate('verifiedBy', 'name email')
			.sort({ createdAt: -1 })
			.limit(10);

		res.status(200).json({
			success: true,
			statistics: {
				pendingVerification: stats[0],
				totalVerified: stats[1],
				approved: stats[2],
				rejected: stats[3],
			},
			aiPerformance: aiStats,
			recentActivity: recentReports,
		});
	} catch (error) {
		console.error('Error fetching NGO dashboard:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch dashboard data',
		});
	}
}

/**
 * Get detailed report information for verification
 */
async function getReportDetails(req, res) {
	try {
		const { reportId } = req.params;

		// Get report with all related data
		const report = await reportsModel
			.findById(reportId)
			.populate('createdBy', 'name email phone')
			.populate('verifiedBy', 'name email');

		if (!report) {
			return res.status(404).json({
				success: false,
				message: 'Report not found',
			});
		}

		// Get AI validation data
		const aiValidation = await AIValidation.findOne({
			report: reportId,
			isActive: true,
		});

		// Prepare full URLs for media
		const baseUrl = `${req.protocol}://${req.get('host')}`;
		const reportWithFullUrls = {
			...report.toObject(),
			media: report.media.map((path) => ({
				url: path.startsWith('http') ? path : `${baseUrl}${path}`,
				path: path,
			})),
		};

		res.status(200).json({
			success: true,
			report: reportWithFullUrls,
			aiValidation: aiValidation || null,
		});
	} catch (error) {
		console.error('Error fetching report details:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch report details',
		});
	}
}

/**
 * Bulk verify multiple reports
 */
async function bulkVerifyReports(req, res) {
	try {
		const { reportIds, decision, comments } = req.body;
		const ngoUserId = res.locals.user?.userId;

		if (!ngoUserId) {
			return res.status(401).json({
				success: false,
				message: 'NGO user authentication required',
			});
		}

		if (!Array.isArray(reportIds) || reportIds.length === 0) {
			return res.status(400).json({
				success: false,
				message: 'reportIds must be a non-empty array',
			});
		}

		if (!['approved', 'rejected'].includes(decision)) {
			return res.status(400).json({
				success: false,
				message: 'Decision must be either "approved" or "rejected"',
			});
		}

		const updateData = {
			verifiedBy: ngoUserId,
			status: decision === 'approved' ? 'verified' : 'rejected',
		};

		// Bulk update reports
		const result = await reportsModel.updateMany(
			{ _id: { $in: reportIds } },
			updateData
		);

		// Update AI validations with human feedback
		for (const reportId of reportIds) {
			try {
				await aiService.updateWithHumanFeedback(
					reportId,
					{
						isMangrove: decision === 'approved',
						comments: comments || `Bulk ${decision}`,
					},
					ngoUserId
				);
			} catch (aiError) {
				console.error(`Failed to update AI feedback for report ${reportId}:`, aiError);
			}
		}

		console.log(`✅ Bulk ${decision} ${reportIds.length} reports by NGO user ${ngoUserId}`);

		res.status(200).json({
			success: true,
			message: `${result.modifiedCount} reports ${decision} successfully`,
			modified: result.modifiedCount,
		});
	} catch (error) {
		console.error('Error bulk verifying reports:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to bulk verify reports',
		});
	}
}

module.exports = {
	getReportsForVerification,
	verifyReport,
	getNGODashboard,
	getReportDetails,
	bulkVerifyReports,
	getAllReports,
	sendToGovernment,
};
