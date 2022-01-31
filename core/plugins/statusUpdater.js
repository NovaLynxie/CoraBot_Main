const logger = require('../utils/winstonLogger.js');
const { activities } = require('../assets/resources/activitiesList.json');
module.exports = (client) => {
	const statusTimer = setInterval(async () => {
		let statusType;
		const index = Math.floor(Math.random() * (activities.length - 1) + 1);
		if (index >= 0 && index <= 1) {
			statusType = 'PLAYING';
		}
		else
		if (index >= 2 && index <= 3) {
			statusType = 'LISTENING';
		}
		else
		if (index >= 4 && index <= 5) {
			statusType = 'WATCHING';
		}
		client.user.setActivity(activities[index], { type: statusType });		
  }, 30 * 1000);
	client.timers.statusUpdate = statusTimer;
};