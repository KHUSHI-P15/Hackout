const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		content: { type: String, required: true },
		media: [{ type: String }], // photos/videos
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // NGO user
	},
	{ timestamps: true }
);
const announcementModel = mongoose.model('announcements', AnnouncementSchema);
module.exports = announcementModel;
