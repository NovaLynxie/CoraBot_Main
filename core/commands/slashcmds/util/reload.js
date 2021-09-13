const { SlashCommandBuilder } = require('@discordjs/builders');
const { loadBotCmds } = require('../../../handlers/cmdLoader');
const logger = require('../../../plugins/winstonLogger');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Allows reload of prefix commands without restarting bot. (CANNOT RELOAD SLASH COMMANDS!)'),
	async execute(interaction, client) {
		logger.warn('Reloading commands! This may take a while');
		logger.debug('Reloading slash commands.');
		await loadBotCmds(client);
		logger.info('Finished reloading commands!');
		interaction.reply(
			{
				content: 'Reloaded commands!',
				ephemeral: true,
			},
		);
	},
};