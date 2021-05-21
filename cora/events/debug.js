const logger = require('../providers/WinstonPlugin');
const {config} = require('../handlers/bootLoader');
const {debug} = config.debug;

module.exports = {
  name: 'debug',
  execute(client) {
    client.on("debug", (info) => {
      if (config.debug === true){
        logger.debug(info)
      }      
    });
  },
};