const { InteractionResponseType } = require('discord-api-types');
const { loadPrefixCmds, loadSlashCmds } = require('../../../handlers/cmdloader');
const logger = require('../../../plugins/winstonplugin');
module.exports = {
  data: {
    name: 'reload',
    aliases: ['refresh'],
    category: 'util',
    description: "Allows reload of all commands without restarting bot."
  },
	async execute(interaction, client) {
    logger.warn('Reloading commands! This may take a while');
    logger.debug('Reloading prefix commands.');
    await loadPrefixCmds(client);
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