const logger = require('../providers/WinstonPlugin');

module.exports = {
  name: 'error',
  execute(client) {
    client.on('error', error => {
      logger.error('Exception thrown by Bot Client!')
      logger.error(error.stack)
    });
  },
};