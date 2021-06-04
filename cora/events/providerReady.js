const logger = require('../providers/WinstonPlugin');

module.exports = {
  name: 'providerReady',
  execute(client) {
    logger.debug('SettingProvider finished initializing. Running database checks.');
    logger.warn('Database checks are still running. This may take a bit.');
  },
};