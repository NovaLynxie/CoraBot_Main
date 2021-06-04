const logger = require('../providers/WinstonPlugin');

module.exports = {
  name: 'providerReady',
  execute() {
    logger.debug('SettingProvider finished initializing.');
  },
};