const botlogs = require('../modules/botLogger');
const logger = require('../providers/WinstonPlugin');

module.exports = {
	name: 'messageUpdate',
	execute(oldMessage, newMessage, client) {
    logger.verbose("event.messageUpdate.trigger()");
    let event = 'messageUpdate', message = {oldMessage, newMessage};
    if (oldMessage.author.id) {
      if (oldMessage.author.id === client.user.id) return;
      if (oldMessage.content === newMessage.content) return;
    } else {
      oldMessage.author.id = 'N/A'
    };    
    botlogs(event, message, client);
	},
};