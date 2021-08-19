const logger = require('../plugins/winstonplugin');
module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
    const client = interaction.client;
    if (interaction.isCommand()) {
      logger.debug(`${interaction.user.tag} in #${interaction.channel.name} from ${interaction.guild.name} triggered interaction '${interaction.commandName}'`);
      if (!client.slashcmds.has(interaction.commandName)) return;
      try {
        await client.slashcmds.get(interaction.commandName).execute(interaction, interaction.client);
      } catch (error) {
        logger.error(error.message); logger.debug(error.stack);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    } else 
    if (interaction.isButton()) {
      logger.data(JSON.stringify(interaction));
      logger.debug(`${interaction.user.tag} in #${interaction.channel.name} from ${interaction.guild.name} triggered componentType=${interaction.componentType} -> id=${interaction.customId}`);
    } else {
      logger.debug('Invalid or malformed interaction called!');
    };
	},
};