const User = require('../models/user.model');
const md5 = require('md5');
const jwt = require('jsonwebtoken');

const roleMap = {
	CITIZEN: 'citizen',
	NGOS: 'ngo',
	RESEARCHERS: 'researcher',
	GOVERNMENT: 'government',
};

async function registerUser(req, res) {
	try {
		const { name, role, password, email, phone } = req.body;

		if (!name || !role || !password || !email || !phone) {
			return res.status(400).json({
				success: false,
				message: 'All fields are required',
			});
		}
		const mappedRole = roleMap[role.toUpperCase()];
		if (!mappedRole) {
			return res.status(400).json({
				success: false,
				message: 'Invalid role selected',
			});
		}
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: 'Email already registered',
			});
		}

		const encryptedPassword = md5(password);
		const newUser = new User({
			name,
			email,
			password: encryptedPassword,
			role: mappedRole,
			phone,
		});

		await newUser.save();

		return res.status(201).json({
			success: true,
			message: 'User registered successfully',
		});
	} catch (error) {
		console.error('Registration error:', error);
		return res.status(500).json({
			success: false,
			message: 'Server error during registration',
		});
	}
}

async function loginUser(req, res) {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: 'Email and password are required',
			});
		}

		const user = await User.findOne({ email, isActive: true });
		if (!user) {
			return res.status(401).json({
				success: false,
				message: 'Invalid email or password',
			});
		}
		const hashedPassword = md5(password);
		if (user.password !== hashedPassword) {
			return res.status(401).json({
				success: false,
				message: 'Invalid email or password',
			});
		}
		const token = jwt.sign(
			{ userId: user._id, email: user.email, role: user.role },
			process.env.JWT_SECRET || 'your_jwt_secret', // Use environment variable for secret
			{ expiresIn: '1d' } // Token expires in 1 day
		);
		return res.status(200).json({
			success: true,
			message: 'Login successful',
			data: {
				token,
				userId: user._id,
				email: user.email,
				role: user.role,
				name: user.name,
			},
		});
	} catch (error) {
		console.error('Login error:', error);
		return res.status(500).json({
			success: false,
			message: 'Server error during login',
		});
	}
}

module.exports = { registerUser, loginUser };
