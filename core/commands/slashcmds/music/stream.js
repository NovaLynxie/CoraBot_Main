const logger = require('../../../plugins/winstonlogger');
const { checkVC, joinVC } = require('../../../handlers/voice/voiceManager');
const { MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stream')
    .setDescription('Streams audio from a valid audio stream URL.')
    .addStringOption(option => 
      option
        .setName('url')
        .setDescription('Enter code to execute')
        .setRequired(false)
    ),
  async execute(interaction, client) {
    let connection = checkVC(interaction.guild);
    if (!connection || connection === undefined) {
      logger.debug(`No connections active for ${interaction.guild.name}! Creating one now.`);
      joinVC(interaction.member.voice.channel);
    } else {
      logger.debug(`Connection active in ${interaction.guild.name}! Using this instead.`);
    }
    interaction.reply({ 
      content: 'Not yet implemented! This may not work as expected.',
      ephemeral: true
    });
  }
};