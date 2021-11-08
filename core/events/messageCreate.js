const logger = require('../plugins/winstonLogger');
const { globalPrefix, ownerIDs } = require('../handlers/bootLoader');
const autoModerator = require('../plugins/autoModerator');
const discordChatBot = require('../plugins/chattyModule');

module.exports = {
	name: 'messageCreate',
	async execute(message, client) {
    let settings = await client.settings.guild.get();
    let { enableAutoMod } = settings.autoMod, { enableChatBot } = settings.chatBot;
		if (message.author.bot) return;
		// handle messages in a guild
		if (message.guild) {
      try {
        await autoModerator(message, client);
        await discordChatBot(message, client);
      } catch (err) {
        logger.debug('A module has errored while processing data!');
        logger.debug(err.stack);
      };			
		} else {
			// handle DMs in private channel
			// NOT YET IMPLEMENTED!
		};
	},
};