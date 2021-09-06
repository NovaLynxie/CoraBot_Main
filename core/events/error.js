const logger = require('../plugins/winstonlogger');

module.exports = {
  name: 'error',
  execute(error) {
    logger.error('Exception thrown by Bot Client!')
    logger.error(error.stack)
  },
};