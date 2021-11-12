const logger = require('../../utils/winstonLogger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { loadBotCmds } = require('../../handlers/cmdLoader');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Force an update of the app (/) commands.'),
	async execute(interaction, client) {
    if (client.options.owners.indexOf(interaction.user.id) <= -1) {
			interaction.reply({
				content: `THAT IS A RESTRICTED COMMAND! YOU ARE NOT AUTHORIZED ${interaction.user.username}!`,
				ephemeral: true,
			});
			logger.warn(`User ${interaction.user.tag} tried to use eval but is not an owner!`);
      return;
		};
		logger.debug('Reloading bot/app commands now.');
    try {
      await loadBotCmds(client);
      logger.debug('Finished reloading all commands!');
      interaction.reply(
        {
          content: 'Reloaded all commands!',
          ephemeral: true,
        },
      );
    } catch (err) {
      interaction.reply(
        {
          content: `Error occured while loading some commands. \n\`\`\` ${err}\`\`\``,
          ephemeral: true,
        },
      );
    };  
	},
};