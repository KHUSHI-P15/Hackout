const mongoose = require('mongoose');

const AIValidationSchema = new mongoose.Schema(
	{
		report: { type: mongoose.Schema.Types.ObjectId, ref: 'reports', required: true },
		aiResult: { 
			type: String, 
			enum: ['mangrove_detected', 'no_mangrove_detected'],
			required: true
		}, // e.g., "mangrove_detected", "no_mangrove_detected"
		confidence: { type: Number, min: 0, max: 100, required: true }, // confidence score (0-100)
		verified: { type: Boolean, default: false }, // human verification
		isActive: { type: Boolean, default: true }, // for soft deletion and record management
		metadata: {
			processingTime: Number, // milliseconds
			flags: [String], // any flags from AI processing
			recommendations: [Object], // AI recommendations
			imageCount: Number, // number of images processed
			detectionMethod: String, // method used for detection
		},
		humanFeedback: {
			verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
			verificationDate: Date,
			humanAssessment: {
				isMangrove: Boolean,
				confidenceRating: Number,
				comments: String,
			},
			aiAccuracy: {
				type: String,
				enum: ['correct', 'incorrect']
			},
		}
	},
	{ timestamps: true }
);

const AIValidation = mongoose.model('AIValidation', AIValidationSchema);
module.exports = AIValidation;
