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
		media: [{ type: String }], // photo/video URLs
		aiVerified: { type: Boolean, default: false }, // AI-based validation
		status: {
			type: String,
			enum: ['pending', 'verified', 'in-progress', 'resolved'],
			default: 'pending',
		},
		verifiedByNGO: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // NGO role
		resolvedByGov: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Gov role
		govReply: { type: String }, // Gov response / attachment link
	},
	{ timestamps: true }
);
const reportModel = mongoose.model('reports', ReportSchema);
module.exports = reportModel;
