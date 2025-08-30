const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const destinationPath = './public/uploads';
		fs.mkdir(destinationPath, { recursive: true }, (err) => {
			if (err) {
				return cb(err);
			}
			cb(null, destinationPath);
		});
	},
	filename: function (req, file, cb) {
		const fileExtension = path.extname(file.originalname);
		cb(null, `${Date.now()}${fileExtension}`);
	},
});
const upload = multer({ 
	storage: storage,
	limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = { upload };
