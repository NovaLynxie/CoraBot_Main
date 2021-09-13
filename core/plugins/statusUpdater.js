const logger = require('./winstonLogger');
const { activities } = require('../assets/resources/activitiesList.json');

module.exports = (client) => {
	// Setup interval timers to update status and database.
	const statusTimer = setInterval(async () => {
		// status updater
		logger.verbose('ran task update_status'); let statusType;
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
		logger.verbose(`Updated status to activity ${index} of ${activities.length - 1}`);
	}, 300000);
	client.timers.statusUpdate = statusTimer;
};
