const { SlashCommandBuilder } = require('@discordjs/builders');
const { loadBotCmds } = require('../../handlers/cmdLoader');
const logger = require('../../plugins/winstonLogger');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Force an update of the app (/) commands.'),
	async execute(interaction, client) {
		logger.debug('Reloading slash commands now.');
		await loadBotCmds(client);
		logger.debug('Finished reloading commands!');
		interaction.reply(
			{
				content: 'Reloaded commands!',
				ephemeral: true,
			},
		);
	},
};