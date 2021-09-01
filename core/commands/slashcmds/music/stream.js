const logger = require('../../../plugins/winstonlogger');
const { joinVC } = require('../../../handlers/music/audioManager');
const { MessageActionRow, MessageButton } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

const connection = joinVoiceChannel({
	channelId: channel.id,
	guildId: channel.guild.id,
	adapterCreator: channel.guild.voiceAdapterCreator,
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stream')
    .setDescription('Streams audio from a valid audio stream URL.')
    .addStringOption(option => 
      option
        .setName('url')
        .setDescription('Enter code to execute'))
        .setRequired(false),
  async execute(interaction, client) {
    console.debug(interaction.channel);
    joinVC(interaction.channel);
  }
}