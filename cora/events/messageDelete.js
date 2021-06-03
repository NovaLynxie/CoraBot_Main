const botlogs = require('../modules/botLogger');
const logger = require('../providers/WinstonPlugin');

module.exports = {
	name: 'messageDelete',
	execute(message, client) {
    logger.verbose("event.messageDelete.trigger()")
    let event = 'messageDelete';
    if (!message.guild) return logger.debug("A messageDelete was triggered from message deleted in bot's DM channel.");
    if (message.author.id === null) {
      message.author.id = undefined;
    }
    if (message.author.id === client.user.id) {
        logger.debug("ignored message, message author is bot.")
        return;
    };
    botlogs(event, message, client);
	},
};