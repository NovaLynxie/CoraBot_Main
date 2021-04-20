const autoRespond = require('../modules/autoResponder.js');
const autoModerator = require('../modules/autoModerator.js');
const logger = require('../providers/WinstonPlugin');
const {config} = require('../handlers/bootLoader.js');
const {prefix} = config;

module.exports = {
  name: 'message',
  execute(message) {
    if (message.author.bot) {
      logger.debug('Author is bot user. Ignoring messages sent by bot.')
      return;
    }
    if (message.content.startsWith(prefix)) {
      logger.debug('Prefix detected! Ignoring as command request.')
      return;
    }
    autoRespond(message);
    autoModerator(message);
  },
};