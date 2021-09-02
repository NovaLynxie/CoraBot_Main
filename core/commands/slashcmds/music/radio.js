const logger = require('../../../plugins/winstonlogger');
const { checkVC, joinVC, createSource, newPlayer } = require('../../../handlers/voice/voiceManager');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stream')
    .setDescription('Streams audio from a valid audio stream URL.'),
  async execute(interaction, client) {
    // processing information so call this to extend the timeout.
    await interaction.deferReply({ ephemeral: true }); 
    
  }
};