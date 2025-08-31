const Community = require('../models/community.model'); 
const User = require('../models/user.model');
const PointsLog = require('../models/pointsLog.model');
const { upload } = require('../utils/multer.utils'); 
const path = require('path');
exports.createPost = [
	upload.array('media', 5),
	async (req, res) => {
		try {
			console.log('createPost: Request received', {
				body: req.body,
				files: req.files,
				user: res.locals.user,
			});
			const { title, content } = req.body;
			const createdBy = res.locals.user?.userId;

			if (!createdBy) {
				console.error('createPost: No user found in res.locals.user');
				return res.status(401).json({ success: false, message: 'User not authenticated' });
			}

			if (!title || !content) {
				console.error('createPost: Missing title or content', { title, content });
				return res
					.status(400)
					.json({ success: false, message: 'Title and content are required' });
			}

			const media = req.files ? req.files.map((file) => `/posts/${file.filename}`) : [];
			console.log('createPost: Media files', media);

			const post = new Community({
				title,
				content,
				media,
				createdBy,
			});
			await post.save();
			console.log('createPost: Post saved', post._id);

			const populatedPost = await Community.findById(post._id)
				.populate('createdBy', 'name')
				.exec();
			if (!populatedPost) {
				console.error('createPost: Failed to populate post', post._id);
				return res.status(500).json({ success: false, message: 'Failed to retrieve post' });
			}
			console.log('createPost: Success', populatedPost);
			res.status(201).json(populatedPost);
		} catch (error) {
			console.error('createPost: Error', error);
			res.status(500).json({ success: false });
		}
	},
];
exports.getAllPosts = async (req, res) => {
	try {
		console.log('getAllPosts: Request received');
		const posts = await Community.find()
			.populate('createdBy', 'name')
			.sort({ createdAt: -1 })
			.exec();
		console.log('getAllPosts: Success', { count: posts.length });
		res.status(200).json(posts);
	} catch (error) {
		console.error('getAllPosts: Error', error);
		res.status(500).json({ success: false });
	}
};

// Unified leaderboard showing top 10 users across all roles
exports.getUnifiedLeaderboard = async (req, res) => {
	try {
		// Aggregate to get total points for all users
		const leaderboard = await User.aggregate([
			{
				$lookup: {
					from: 'pointslogs',
					localField: '_id',
					foreignField: 'user',
					as: 'pointsLogs'
				}
			},
			{
				$addFields: {
					totalPoints: { 
						$sum: '$pointsLogs.points' 
					}
				}
			},
			{
				$lookup: {
					from: 'reports',
					localField: '_id',
					foreignField: 'createdBy',
					as: 'reports'
				}
			},
			{
				$addFields: {
					reportsCount: { $size: '$reports' },
					verifiedReports: {
						$size: {
							$filter: {
								input: '$reports',
								cond: { $eq: ['$$this.status', 'verified'] }
							}
						}
					}
				}
			},
			{
				$project: {
					name: 1,
					email: 1,
					role: 1,
					isVerified: 1,
					totalPoints: 1,
					reportsCount: 1,
					verifiedReports: 1,
					createdAt: 1
				}
			},
			{ $sort: { totalPoints: -1, createdAt: 1 } },
			{ $limit: 10 } // Top 10
		]);

		res.json({ 
			success: true, 
			data: leaderboard 
		});
	} catch (error) {
		console.error('getUnifiedLeaderboard ERROR:', error);
		res.status(500).json({ success: false, error: error.message });
	}
};
