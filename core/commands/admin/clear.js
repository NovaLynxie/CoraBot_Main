const logger = require('../../plugins/winstonLogger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const guildLogger = require('../../plugins/guildLogging');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear a select number of messages.')
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Number of messages to delete?')
        .setRequired(true)
    ),
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const amount = interaction.options.getInteger('amount');
    const executor = interaction.member; const guild = interaction.guild;
    const settings = await client.settings.guild.get(guild); const { roles } = settings;
    const messages = await interaction.channel.messages.fetch({ limit: amount });
    try {
      if (messages) {
        await interaction.channel.bulkDelete(messages);
      } else {
        await interaction.channel.bulkDelete(amount);
      };
    } catch (err) {
      logger.debug(`Failed to delete messages in ${interaction.channel.name}!`);
      await interaction.editReply({
        content: 'Unable to delete messages! Possibly missing manage messages permissions?',
      });
      logger.debug(err.stack);
      return;
    };
    if (executor.roles.cache.some(role => roles.staff.indexOf(role.id))) {
      guildLogger('clear', { executor, messages }, client);
      interaction.editReply({
        content: `Cleared ${amount} messages successfully!`, ephemeral: true
      });
    } else {
      interaction.editReply({
        content: 'You are not a staff member or are missing the required roles to use this command here!', ephemeral: true
      });
    };
  }
};