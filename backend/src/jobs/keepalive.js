const logger = require('./../utils/logger.js');

const ping = async () => {
	try {
		await fetch(process.env.keepAlive);
		logger.info("Pinged the server to keep it alive.");

	}
	catch (error) {
		logger.error("Error in ping", error);
	}
}

async function keepAlive() {
	logger.info("Keep alive scheduled to run every 5 minutes.");
	await ping();
	setInterval( ping , 5 * 60 * 1000); 
}

module.exports = { keepAlive };