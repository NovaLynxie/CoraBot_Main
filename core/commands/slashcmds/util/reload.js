const { SlashCommandBuilder } = require('@discordjs/builders');
const { loadPrefixCmds, loadSlashCmds } = require('../../../handlers/cmdLoader');
const logger = require('../../../plugins/winstonLogger');
module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription("Allows reload of prefix commands without restarting bot. (CANNOT RELOAD SLASH COMMANDS!)"),
	async execute(interaction, client) {
    logger.warn('Reloading commands! This may take a while');
    logger.debug('Reloading prefix commands.');
    await loadPrefixCmds(client); // depreciated! may no longer be used.
    logger.debug('Reloading slash commands.');
    await loadSlashCmds(client);
    logger.info('Finished reloading commands!')
    interaction.reply(
      {
        content: 'Reloaded commands!', 
        ephemeral: true
      }
    )
	},
};