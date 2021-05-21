const logger = require('../providers/WinstonPlugin');

module.exports = {
  name: 'disconnect',
  execute(client) {
    client.on('disconnect', (event) => {
      logger.warn('Client websocket closed connection.')
    });
  },
};