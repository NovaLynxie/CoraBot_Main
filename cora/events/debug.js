const logger = require('../providers/WinstonPlugin');
const {config} = require('../handlers/bootLoader');
const {debug} = config;

module.exports = {
  name: 'debug',
  execute(message, client) {
    client.on("debug", (info) => {
      logger.verbose(`debug = ${debug}`)
      if (debug === "true"){
        logger.debug(info)
      }      
    });
  },
};