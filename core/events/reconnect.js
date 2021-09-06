const logger = require('../plugins/winstonLogger');

module.exports = {
  name: 'reconnect',
  execute(client) {
    logger.warn('Client reconnected to Discord.');
  },
};