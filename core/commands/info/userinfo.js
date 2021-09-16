const logger = require('../../plugins/winstonLogger');
const moment = require('moment');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Gets user information and returns an embed.')
    .addUserOption(option => 
      option
        .setName('target')
        .setDescription('Select a user')
        .setRequired(true)
    ),
  async execute (interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const member = interaction.options.getMember('target');
    const user = member.user;
    const defaultRole = interaction.guild.roles.cache.get(interaction.guild.id);
    const roles = member.roles.cache   
      .filter( role => role.id !== defaultRole.id)
      .sort((a, b) => b.position - a.position)
      .map(role => role.name);
    const userInfoEmbed = new MessageEmbed()
      .setTitle('User Information')
      .setColor(0xE7A3F0)
      .setDescription('Provides detailed information about any users in a guild.')
      .addFields(
        {
          name: '> Member Information',
          value: stripIndents`
            Username: ${user.username}#${user.discriminator}
            Nickname: ${member.nickname ? member.nickname : "N/A"}
            Joined: ${moment.utc(member.joinedTimestamp).format('dddd, MMMM Do YYYY, HH:mm:ss Z')}
            Roles: ${roles.length}
            (${roles.length ? roles.join(', ') : "None"})
          `
        },
        {
          name: '> User Information',
          value: stripIndents`
            Bot Acc: ${user.bot}
            Created: ${moment.utc(user.createdAt).format('dddd, MMMM Do YYYY, HH:mm:ss Z')}
            Status: ${(member?.presence.status) ? member?.presence.status : 'unknown'}
            Activity: ${(member?.presence.game) ? member?.presence.game.name : 'no data'}
          `
        }
      )
      .setThumbnail(user.displayAvatarURL({ format: 'png' }))
    return interaction.editReply({ embeds: [userInfoEmbed] });
  }
};
