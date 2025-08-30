const mongoose = require('mongoose');

const CommunitySchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		content: { type: String, required: true },
		media: [{ type: String }], // photos/videos
		createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }, // NGO user
	},
	{ timestamps: true }
);
const communityModel = mongoose.model('posts', CommunitySchema);
module.exports = communityModel;
