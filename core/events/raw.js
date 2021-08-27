const logger = require("../plugins/winstonlogger");

module.exports = {
    name: 'raw',
    execute(data, client) {
        logger.data(data);
        client.manager.updateVoiceState(data);
    }
}