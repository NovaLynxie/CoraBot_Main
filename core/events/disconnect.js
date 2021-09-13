const logger = require('../plugins/winstonLogger');

module.exports = {
	name: 'disconnect',
	execute(client) {
		logger.warn('Client disconnected from Discord.');
	},
};