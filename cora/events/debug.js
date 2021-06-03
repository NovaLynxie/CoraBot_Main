const logger = require('../providers/WinstonPlugin');
const {config} = require('../handlers/bootLoader');
const {debug} = config;

module.exports = {
  name: 'debug',
  execute(data) {
    if (debug===true) {
      logger.debug(data)
    }    
  },
};