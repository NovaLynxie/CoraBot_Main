const logger = require('../utils/winstonLogger');
const { eventLog } = require('../plugins/guildLogger');

module.exports = {
	name: 'messageDelete',
	execute(message, client) {
    const guild = message.guild, channel = message.channel;    
    const member = guild.members.cache.get(message.author.id);
    if (message.author.id === null) {
      message.author.id = undefined;
    }
    if (message.author.id === client.user.id) {
      return logger.debug("Ignored message, message author is bot.");
    };
    eventLog('messageDelete', guild, { channel, message, member }, client);
	},
};