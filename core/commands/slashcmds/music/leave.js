const logger = require('../../../plugins/winstonLogger');
const { checkVC } = require('../../../handlers/voice/voiceManager');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Disconnects the bot from the voice channel.'),
  async execute(interaction, client) {
    let connection = checkVC(interaction.guild);
    if (!connection || connection === undefined) {
      logger.debug(`No active connections found for ${interaction.guild.name}!`);
      return interaction.reply({
        content: 'Bot is not connected to/or in a voicechannel!',
        ephemeral: true
      });
    } else {
      logger.debug(`Found active connection in ${interaction.guild.name}!`);
      connection.destroy();
      return interaction.reply({
        content: 'Disconnected bot from active connection!',
        ephemeral: true
      });
    };
  }
};