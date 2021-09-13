const logger = require('../plugins/winstonLogger');

module.exports = {
	name: 'reconnect',
	execute() {
		logger.debug('Reconnecting to discord. Please wait...');
    logger.info('Client reconnecting to Discord.');
	},
};