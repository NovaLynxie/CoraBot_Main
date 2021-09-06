const logger = require('../plugins/winstonLogger');

module.exports = {
  name: 'error',
  execute(error) {
    logger.error('Exception thrown by Bot Client!')
    logger.error(error.stack)
  },
};