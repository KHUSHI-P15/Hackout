const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 587,
	secure: false,
	auth: {
		user: 'pmsss1728@gmail.com',
		pass: 'plesguwkzzfsgfde',
	},
});

async function sendResetPasswordEmail(email, name, username, newPassword) {
	const mailOptions = {
		from: `"Team SkillScript" <${process.env.MAIL_USER}>`,
		to: email,
		subject: 'Password Reset - New Login Credentials',
		html: `
      <p>Dear <strong>${name}</strong>,</p>
      <p>Your password has been reset as per your request.</p>
      <p>Please use the following credentials to log in:</p>
      <ul>
        <li><strong>Username:</strong> ${username}</li>
        <li><strong>Password:</strong> ${newPassword}</li>
      </ul>
      <p>It is recommended to change your password after logging in.</p>
      <br>
      <p>Regards,<br>SkillScript</p>
    `,
	};

	try {
		await transporter.sendMail(mailOptions);
	} catch (error) {
		console.error('Failed to send reset password email:', error);
		throw error;
	}
}

module.exports = {
	sendResetPasswordEmail,
};
