const logger = require('../plugins/winstonplugin');
module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
    let client = interaction.client;
		logger.debug(`${interaction.user.tag} in #${interaction.channel.name} from ${interaction.guild.name} triggered interaction '${interaction.commandName}'`);
    if (!interaction.isCommand()) return;
    if (!client.slashcmds.has(interaction.commandName)) return;
    try {
      await client.slashcmds.get(interaction.commandName).execute(interaction, interaction.client);
    } catch (error) {
      logger.error(error.message); logger.debug(error.stack);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
	},
};