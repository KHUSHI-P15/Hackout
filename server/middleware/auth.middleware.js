const jwt = require('jsonwebtoken');
const User = require('../models/user.model'); // Adjust path to your User model

function authMiddleware(roles = []) {
	return async (req, res, next) => {
		// Check for Authorization header
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({
				success: false,
				message: 'Authorization token missing or malformed',
			});
		}

		// Extract token
		const token = authHeader.split(' ')[1];

		try {
			// Verify JWT token
			const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

			// Find user by ID and ensure they are active
			const user = await User.findOne({ _id: decoded.userId, isActive: true });
			if (!user) {
				return res.status(401).json({
					success: false,
					message: 'Invalid or inactive user',
				});
			}

			// Check if user has one of the required roles (if roles are specified)
			if (roles.length > 0 && !roles.includes(user.role)) {
				return res.status(403).json({
					success: false,
					message: 'Forbidden: insufficient privileges',
				});
			}

			// Store user data in res.locals for downstream use
			res.locals.user = {
				userId: user._id,
				email: user.email,
				role: user.role,
				name: user.name,
			};

			next();
		} catch (err) {
			console.error('Auth middleware error:', err);
			return res.status(401).json({
				success: false,
				message: 'Invalid or expired token',
			});
		}
	};
}

module.exports = { authMiddleware };
