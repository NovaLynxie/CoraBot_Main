const logger = require('../utils/winstonLogger');

module.exports = {
	name: 'rateLimit',
	execute(data) {
		logger.debug('Discord API Error! Rate Limit Reached!');
    logger.debug(`Timeout: ${data.timeout}`)
    logger.debug(`Limit: ${data.limit}`)
    logger.debug(`Method: ${data.method}`)
    logger.debug(`Path: ${data.path}`)
    logger.debug(`Route: ${data.route}`)
    logger.debug(`Global Route? ${(data.global) ? 'Yes' : 'No'}`)
    logger.data(JSON.stringify(data, null, 2));
	},
};