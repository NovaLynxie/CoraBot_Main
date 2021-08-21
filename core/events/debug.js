const logger = require('../plugins/winstonlogger');
const {config} = require('../handlers/bootloader');
const {debug} = config;
let retries = 4;
module.exports = {
  name: 'debug',
  execute(data) {
    if (debug===true) {
      if (data.includes("429 hit on route /gateway/bot")) {
        logger.debug(`Failed to connect to Discord!`); retries--;
        logger.debug(`Retrying ${retries} more times...`);
        if (retries >= 0) {
          logger.error('Discord API Error! 429 - Ratelimit Exceeded!');
          logger.warn('Bot may have exceeded maximum login limit for this IP address.');
          logger.warn('If this error re-occurs, try again in 24hrs or contact Discord support.');
          process.exit(0); // exit process after 4 tries.
        }
      }
      logger.debug(data);
      logger.verbose(typeof data);
    }
  },
};