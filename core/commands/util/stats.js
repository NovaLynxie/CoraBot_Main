const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
require('moment-duration-format');
const { stripIndents } = require('common-tags');
const { version } = require('../../../package.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
		.setDescription('Gets basic statistics on the bot.'),
  execute(interaction, client) {
    var Servers = client.guilds.cache.size
    var Channels = client.channels.cache.size
    var Users = client.users.cache.filter(user => !user.bot).size
    const statsEmbed = new MessageEmbed()
      .setTitle("Bot Statistics")
      .setColor(0xE7A3F0)
      .addFields(
        {
          name: '> Total Uptime',
          value: moment.duration(client.uptime)
            .format('d[ days], h[ hours], m[ minutes ]s[ seconds]'),
          inline: true
        },
        {
          name: '> Memory Usage',
          value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
        },
        {
          name: '> General Stats',
          value: stripIndents`
              Guilds: ${Servers} servers
              Channels: ${Channels} channels
              Users: ${Users} users
              `
        },
        {
          name: '> Version',
          value: `v${version}`,
          inline: true
        }
      )
      .setThumbnail(client.user.displayAvatarURL({ formant: 'png' }))
    return interaction.reply({ embeds: [statsEmbed] });
  }
};