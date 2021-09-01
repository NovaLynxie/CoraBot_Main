const logger = require('../../../plugins/winstonlogger');
const { joinVC } = require('../../../handlers/music/audioManager');
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
    joinVC(interaction.channel);
    interaction.reply({ 
      content: 'Not yet implemented! This may not work as expected.',
      ephemeral: true
    });
  }
};