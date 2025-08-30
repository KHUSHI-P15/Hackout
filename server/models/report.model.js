const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		description: { type: String },
		category: {
			type: String,
			enum: ['cutting', 'dumping', 'encroachment', 'pollution', 'other'],
			required: true,
		},
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		location: {
			lat: Number,
			lng: Number,
			address: String,
		},
		media: [{ type: String }], // photo
		aiVerified: { type: Boolean, default: true },
		status: {
			type: String,
			enum: ['pending', 'verified', 'in-progress', 'resolved'],
			default: 'pending',
		},
		severity: {
			type: String,
			enum: ['low', 'medium', 'high'],
			default: 'low', // optional: you can remove default if you want it mandatory
		},
		verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // NGO role
		resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Gov role or NGO
		govReplies: [
			{
				text: String,
				attachments: [String],
				repliedAt: { type: Date, default: Date.now },
			},
		],
	},
	{ timestamps: true }
);
const reportModel = mongoose.model('reports', ReportSchema);
module.exports = reportModel;
