const logger = require('../../utils/winstonLogger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { modLog } = require('../../plugins/guildLogger');

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
    const channel = interaction.channel;
    const amount = interaction.options.getInteger('amount');
    const executor = interaction.member; const guild = interaction.guild;
    const settings = await client.settings.guild.get(guild); const { roles } = settings;
    const messages = await channel.messages.fetch({ limit: amount });
    try {
      if (messages) {
        await channel.bulkDelete(messages);
      } else {
        await channel.bulkDelete(amount);
      };
    } catch (err) {
      logger.debug(`Failed to delete messages in ${channel.name}!`);
      await interaction.editReply({
        content: 'Unable to delete messages! Possibly missing manage messages permissions?',
      });
      logger.debug(err.stack);
      return;
    };
    if (executor.roles.cache.some(role => roles.staff.indexOf(role.id))) {
      modLog('clear', guild, { executor, messages, channel }, client);
      interaction.editReply({
        content: `Cleared ${amount} messages successfully!`, ephemeral: true
      });
    } else {
      interaction.editReply({
        content: 'You do not have permissions to run this command!', ephemeral: true
      });
    };
  }
};