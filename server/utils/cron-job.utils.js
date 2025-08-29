const cron = require('node-cron');
const axios = require('axios');

// Schedule to run every hour (at minute 0)
cron.schedule('30 * * * *', async () => {
	try {
		console.log(`Calling API at ${new Date().toLocaleString()}`);
		const response = await axios.get(process.env.LOCAL_URL);
		const response1 = await axios.get(process.env.LIVE_URL);
		console.log('API response:', response.data);
		console.log('API response 1:', response1.data);
	} catch (error) {
		console.error('API call failed:', error.message);
	}
});

console.log('Cron job is running...');
