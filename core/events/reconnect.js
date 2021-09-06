const logger = require('../plugins/winstonlogger');

module.exports = {
  name: 'reconnect',
  execute(client) {
    logger.warn('Client reconnected to Discord.');
  },
};