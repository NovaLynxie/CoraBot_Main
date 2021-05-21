const logger = require('../providers/WinstonPlugin');

module.exports = {
  name: 'disconnect',
  execute(client) {
    client.on('disconnect', error => {
      logger.warn('Client websocket closed connection.')
      if (error) {
        logger.error('An error was thrown during disconnect event!')
        logger.error(error.stack)
      }      
    });
  },
};