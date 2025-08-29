const mongoose = require('mongoose');

const PointsLogSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		action: { type: String, enum: ['report_added', 'report_verified', 'awareness_posted'] },
		points: { type: Number },
	},
	{ timestamps: true }
);
const pointsLogModel = mongoose.model('pointsLogs', PointsLogSchema);
module.exports = pointsLogModel;
