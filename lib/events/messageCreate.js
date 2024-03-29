const logger = require('../utils/winstonLogger');
const autoModerator = require('../plugins/autoModerator');
const discordChatBot = require('../plugins/chattyModule');

module.exports = {
	name: 'messageCreate',
	async execute(message, client) {
		if (message.author.bot) return;		
		if (message.guild) {
      // handle messages in any viewable guild text channel
      try {
        await autoModerator(message, client);
        await discordChatBot(message, client);
      } catch (err) {
        logger.debug('A module has errored while processing data!');
        logger.debug(err.stack);
      };			
		} else {
			// handle messages in private or group dm channels
			// NOT YET IMPLEMENTED!
		};
	},
};