const logger = require('../providers/WinstonPlugin');

module.exports = {
  name: 'disconnect',
  execute(client) {
    logger.warn('Client websocket closed connection.');
  },
};