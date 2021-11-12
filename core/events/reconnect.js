const logger = require('../utils/winstonLogger');

module.exports = {
	name: 'reconnect',
	execute() {
		logger.debug('Reconnecting to discord. Please wait...');
    logger.info('Attempting to reconnect to Discord.');
	},
};