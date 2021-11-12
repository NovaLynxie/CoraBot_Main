const logger = require('../utils/winstonLogger');

module.exports = {
	name: 'rateLimit',
	execute(data) {
		logger.fatal('Discord API Error! Rate Limit Reached!');
    logger.fatal(`Timeout: ${data.timeout}`)
    logger.fatal(`Limit: ${data.limit}`)
    logger.fatal(`Method: ${data.method}`)
    logger.fatal(`Path: ${data.path}`)
    logger.fatal(`Route: ${data.route}`)
    logger.fatal(`Global Route? ${(data.global) ? 'Yes' : 'No'}`)
    logger.data(JSON.stringify(data, null, 2));
	},
};