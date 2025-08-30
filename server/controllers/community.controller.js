const Community = require('../models/community.model'); // Corrected path
const { upload } = require('../utils/multer.utils'); // Corrected path
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
			// Validate user
			if (!createdBy) {
				console.error('createPost: No user found in res.locals.user');
				return res.status(401).json({ success: false, message: 'User not authenticated' });
			}
			// Validate required fields
			if (!title || !content) {
				console.error('createPost: Missing title or content', { title, content });
				return res
					.status(400)
					.json({ success: false, message: 'Title and content are required' });
			}
			// Process uploaded files
			const media = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : [];
			console.log('createPost: Media files', media);
			// Create new post
			const post = new Community({
				title,
				content,
				media,
				createdBy,
			});
			await post.save();
			console.log('createPost: Post saved', post._id);
			// Populate createdBy field
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
