const { UTApi } = require('uploadthing/server');
const fs = require('fs');
const utapi = new UTApi();

/**
 * returns url of the file
 * @param {*} path req.file.path
 * @param {*} filename req.file.filename
 */
const uploadFile = async function (path, filename) {
	try {
		const fileBuffer = fs.readFileSync(path);
		const uploadedFile = await utapi.uploadFiles(new File([fileBuffer], filename));
		console.log(uploadedFile);
		if (!uploadedFile.error) {
			console.log('FILE UPLOADED SUCCESSFULLY!');
			return uploadedFile.data.ufsUrl;
		}
		throw new Error();
	} catch (e) {
		throw new Error('There was an error uploading file!');
	}
};

module.exports = uploadFile;
