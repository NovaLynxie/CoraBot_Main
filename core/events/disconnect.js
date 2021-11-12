const logger = require('../utils/winstonLogger');

module.exports = {
	name: 'disconnect',
	execute() {
		logger.debug('Disconnected! Will no longer attempt reconnect.');
    logger.warn('Client disconnected from Discord.');    
	},
};