const jwt = require('jsonwebtoken');
const md5 = require('md5');
const userModel = require('../models/user.model');
const studentModel = require('../models/student.model');
const facultyModel = require('../models/faculty.model');
const { sendResetPasswordEmail } = require('../utils/mailer');

async function login(req, res) {
	const { username, password, role } = req.body;

	if (!username || !password || !role)
		return res
			.status(400)
			.json({ success: false, message: 'username, password and role required' });

	let profile = null;
	let user = await userModel.findOne({ username: username, password: md5(password) });
	if (!user) return res.status(404).json({ message: 'User not found' });

	if (user.role === 'STUDENT') {
		profile = await studentModel.findOne({ userId: user._id });
		if (!profile) return res.status(404).json({ message: 'Student profile not found' });
	} else if (user.role === 'AUTHORITY') {
		profile = await facultyModel.findOne({ userId: user._id });
		if (!profile) return res.status(404).json({ message: 'Authority profile not found' });
	}

	const token = jwt.sign(
		{
			_id: user._id,
			permissions: user.permissions,
			role: user.role == 'STUDENT' ? user.role : profile.role,
		},
		process.env.JWT_SECRET,
		{ expiresIn: '1d' }
	);

	user.currentToken = token;
	await user.save();

	res.json({
		success: true,
		data: {
			token,
			username: user.username,
			role: user.role == 'STUDENT' ? user.role : profile.role,
			_id: user._id,
			profile: profile,
		},
	});
}

async function logout(req, res) {
	await userModel.updateOne({ _id: req.body._id }, { currentToken: null });
	res.clearCookie('auth');
	return res.json({ success: true });
}

async function forgotPassword(req, res) {
	const { username } = req.body;

	if (!username) {
		console.error('Forgot password error: Username missing');
		return res.status(400).json({ success: false, message: 'Username is required' });
	}

	try {
		const user = await userModel.findOne({ username });
		if (!user) {
			console.error(`Forgot password error: User not found for username ${username}`);
			return res.status(404).json({ success: false, message: 'User not found' });
		}

		let profile = null;
		if (user.role === 'STUDENT') {
			profile = await studentModel.findOne({ userId: user._id });
			if (!profile) {
				console.error(
					`Forgot password error: Student profile not found for user ${user._id}`
				);
				return res
					.status(404)
					.json({ success: false, message: 'Student profile not found' });
			}
		} else if (user.role === 'AUTHORITY') {
			profile = await facultyModel.findOne({ userId: user._id });
			if (!profile) {
				console.error(
					`Forgot password error: Authority profile not found for user ${user._id}`
				);
				return res
					.status(404)
					.json({ success: false, message: 'Authority profile not found' });
			}
		}

		if (!profile.email) {
			console.error(
				`Forgot password error: Email not found for user ${username} with role ${user.role}`
			);
			return res
				.status(404)
				.json({ success: false, message: 'Email not found for this user' });
		}

		const newPassword = generateTempPassword();
		await userModel.updateOne(
			{ _id: user._id },
			{ password: md5(newPassword) } // Hashing with md5 to match login logic
		);

		await sendResetPasswordEmail(profile.email, profile.fullname, username, newPassword);

		console.log(`Password reset email sent to ${profile.email} for username ${username}`);
		return res.json({
			success: true,
			message: 'Password reset email sent successfully',
		});
	} catch (error) {
		console.error('Forgot password error:', error.message, error.stack);
		return res
			.status(500)
			.json({ success: false, message: 'Failed to process password reset' });
	}
}

async function verify(req, res) {
	const token = req.headers.authorization?.split(' ')[1];
	if (!token) {
		return res.status(401).json({ error: 'Authorization token missing' });
	}
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await userModel.findById(decoded._id);
		if (!user || user.currentToken !== token) {
			return res.status(401).json({ error: 'Invalid or expired token' });
		}

		res.json({
			success: true,
			data: {
				username: user.username,
				role: user.role,
				_id: user._id,
			},
		});
	} catch (err) {
		console.error('JWT verification error:', err);
		return res.status(401).json({ error: 'Invalid or expired token' });
	}
}

function generateTempPassword() {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
	let password = '';
	for (let i = 0; i < 12; i++) {
		password += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return password;
}

async function changePassword(req, res) {
	const { userId, currentPassword, newPassword } = req.body;

	if (!currentPassword || !newPassword) {
		return res.status(400).json({ message: 'All fields are required' });
	}

	const user = await userModel.findById(userId);

	if (!user) {
		return res.status(404).json({ message: 'User not found' });
	}

	// Verify current password
	if (user.password !== md5(currentPassword)) {
		return res.status(400).json({ message: 'Current password is incorrect' });
	}

	// Prevent same password
	if (md5(newPassword) === user.password) {
		return res.status(400).json({ message: 'New password must be different from current' });
	}

	// Save new password
	user.password = md5(newPassword);
	await user.save();

	return res.status(200).json({ success: true, message: 'Password updated successfully' });
}

module.exports = {
	login,
	logout,
	forgotPassword,
	verify,
	changePassword,
};
