const logger = require('../plugins/winstonlogger');

module.exports = {
  name: 'warn',
  execute(data) {
    logger.warn('Unusual response received.');
    logger.warn(data);
  },
};