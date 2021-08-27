const logger = require("../../plugins/winstonlogger");

module.exports = {
    name: 'nodeError',
    execute(node, error) {
        logger.error(`Node "${node.options.identifier}" encountered an error!`);
        logger.error(error.message); logger.debug(error.stack);
    }
};