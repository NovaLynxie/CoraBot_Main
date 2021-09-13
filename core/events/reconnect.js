const logger = require('../plugins/winstonLogger');

module.exports = {
	name: 'reconnect',
	execute(client) {
		logger.info('Client reconnected to Discord.');
    logger.info(`Logged in as ${client.user.tag}`);
	},
};