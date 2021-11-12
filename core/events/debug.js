const logger = require('../utils/winstonLogger');
const { config } = require('../handlers/bootLoader');
const { debug } = config;
let retries = 3;

module.exports = {
	name: 'debug',
	execute(data) {
		if (debug === true) {
			if (data.includes('429 hit on route /gateway/bot')) {
				logger.debug('Failed to connect to Discord!'); retries--;
				logger.debug(`Retrying ${retries} more times...`);
				if (retries >= 0) {
					logger.error('Discord API Error! 429 - Ratelimit Exceeded!');
					logger.warn('Bot may have exceeded maximum login limit for this IP address.');
					logger.warn('If this error re-occurs, try again in 24hrs or contact Discord support.');
					process.exit(0);
				};
			};
			logger.debug(data);
			logger.verbose(typeof data);
		};
	},
};