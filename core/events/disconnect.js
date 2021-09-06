const logger = require('../plugins/winstonlogger');

module.exports = {
  name: 'disconnect',
  execute(client) {
    logger.warn('Client disconnected from Discord.');
  },
};