const logger = require("../../plugins/winstonlogger");

module.exports = {
    name: 'nodeConnect',
    execute(node) {
        logger.info(`Node "${node.options.identifier}" connected!`);
        logger.debug(JSON.stringify(node.options, null, 2));
    }
};