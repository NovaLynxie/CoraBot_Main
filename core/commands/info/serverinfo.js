const logger = require('../../plugins/winstonLogger');
const locales = require('../../assets/resources/localeCodes.json');
const { SlashCommandBuilder, time } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');

const filterLevels = {
  DISABLED: 'Off',
  MEMBERS_WITHOUT_ROLES: 'No Role',
  ALL_MEMBERS: 'Everyone'
};
const verificationLevels = {
  NONE: 'None',
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: '(╯°□°）╯︵ ┻━┻',
  VERY_HIGH: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('guild')
    .setDescription('All the information about your guild in a simple handy embed.'),
  execute(interaction, client) {
    const guild = interaction.guild;
    const defaultRole = interaction.guild.roles.cache.get(interaction.guild.id);

    const roles = guild.roles.cache.sort((a, b) => b.position - a.position).map(role => role.toString());
    const members = guild.members.cache;
    const channels = guild.channels.cache;
    const emojis = guild.emojis.cache;

    const guildInfoEmbed = new MessageEmbed()
      .setTitle('Guild Information')
      .setColor(0xE7A3F0)
      .setDescription('Useful information about this server')
      .addFields(
        {
          name: '> General Info',
          value: stripIndents`
            Name: ${guild.name} (ID: ${guild.id})
            Created: ${time(guild.createdAt)}
            (${roles.length ? roles.join(', ') : "No role data!"})
            Locale: ${locales[guild.preferredLocale]}           
          `
        },
        {
          name: '> Description (About Us)',
          value: stripIndents`
            ${(guild.description) ? guild.description : 'No description'}
          `
        },
        {
          name: '> Boost Details',
          value: stripIndents`
            Tier: ${guild.premiumTier ? `Tier ${guild.premiumTier}` : 'None'}
            Subs: ${guild.premiumSubscriptionCount || '0'}
          `
        },
        {
          name: "> Statistics",
          value: stripIndents`          
            Roles: ${roles.length}
            Emojis: ${emojis.size}
            Channels: ${channels.size} (${channels.filter(channel => channel.type === 'text').size} text, ${channels.filter(channel => channel.type === 'voice').size} voice)
            Members: ${message.guild.memberCount} (${members.filter(member => !member.user.bot).size} users, ${members.filter(member => member.user.bot).size} bots)
            MFA Level: ${(guild.mfaLevel === 'ELEVATED') ? 'Elevated' : 'None'}
            Verify Level: ${verificationLevels[guild.verificationLevel]}
            Explicit Filter: ${filterLevels[guild.explicitContentFilter]}
          `
        },
        {
          name: "> Presences",
          value: stripIndents`
             Online: ${ members.filter(member => member.presence.status === 'online').size } members
             Idle: ${ members.filter(member => member.presence.status === 'idle').size } members
             Do Not Disturb: ${ members.filter(member => member.presence.status === 'dnd').size } members
             Offline: ${ members.filter(member => member.presence.status === 'offline').size } members
          `
        },
        {
          name: "> Roles",
          value: roles.join(', ')
        }
      )
      .setThumbnail(user.displayAvatarURL({ format: 'png' }))
return interaction.reply({ embeds: [userInfoEmbed] });
  }
};