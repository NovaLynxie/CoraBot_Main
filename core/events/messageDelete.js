const { eventLog } = require('../plugins/guildLogger');
const logger = require('../plugins/winstonPlugin');

module.exports = {
	name: 'messageDelete',
	execute(message, client) {
    logger.verbose("event.messageDelete.trigger()")
    let event = 'messageDelete';
    if (message.author.id === null) {
      message.author.id = undefined;
    }
    if (message.author.id === client.user.id) {
        logger.debug("ignored message, message author is bot.")
        return;
    };
    eventLog(event, message, client);
	},
};