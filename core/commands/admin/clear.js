const logger = require('../../plugins/winstonLogger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const guildLogger = require('../../plugins/guildLogging');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear a select number of messages.')
    .addIntegerOption(option =>
      option
        .setName('limit')
        .setDescription('Number of messages to delete?')
        .setRequired(true)
    ),
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const limit = interaction.options.getInteger('limit');
    const executor = interaction.member; const guild = interaction.guild;
    const settings = await client.settings.guild.get(guild); const { roles } = settings;
    try {
      await interaction.channel.bulkDelete(limit);
    } catch (err) {
      logger.debug(`Failed to delete messages in ${interaction.channel.name}!`);
      await interaction.editReply({
        content: 'Unable to delete messages! Possibly missing manage messages permissions?'
        ephemeral: true
      });
      return;
    };    
    if (executor.roles.cache.some(role => roles.staff.indexOf(role.id))) {
      guildLogger('clear', { executor }, client);
      interaction.editReply({
        content: `Cleared ${limit} messages successfully!`, ephemeral: true
      });
    } else {
      interaction.editReply({
        content: 'You are not a staff member or are missing the required roles to use this command here!', ephemeral: true
      });
    };
  }
};