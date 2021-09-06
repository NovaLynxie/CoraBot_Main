const logger = require('../plugins/winstonLogger');

module.exports = {
  name: 'warn',
  execute(data) {
    logger.warn('Unusual response received.');
    logger.warn(data);
  },
};