const logger = require('../providers/WinstonPlugin');

module.exports = {
  name: 'warn',
  execute(data) {
    logger.warn(data);
  },
};