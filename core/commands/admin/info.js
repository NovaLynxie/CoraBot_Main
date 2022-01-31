const logger = require('../../utils/winstonLogger');
const locales = require('../../assets/resources/localeCodes.json');
const levels = require('../../assets/resources/guildLevels.json');
const { SlashCommandBuilder, time } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Fetch information about the bot, server or any user.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('bot')
        .setDescription('Show information about the bot.')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('guild')
        .setDescription('Show information about your guild.')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('user')
        .setDescription('Fetch any user details.')
        .addUserOption(option =>
          option
            .setName('target')
            .setDescription('User mentionable, ID or username')
            .setRequired(true)
        )
    ),
  async execute(interaction, client) {
    await interaction.deferReply();
    const options = interaction.options;
    const member = options.getMember('target') || interaction.member;
    const subcmd = options.getSubcommand();
    const guild = interaction.guild;
    let data, type;
    async function dynamicEmbed(data, type) {
      const embed = new MessageEmbed(); embed.setColor('#73f5d2');
      switch (type) {
        case 'bot':
          client.application = await client.application.fetch();
          embed
            .setTitle('About Bot')
            .setThumbnail(client.user.displayAvatarURL())
            .setDescription(client.application.description || 'No description set!');
          break;
        case 'guild':
          const guild = data;
          const members = guild.members.cache;
          const presences = guild.presences.cache;
          const channels = guild.channels.cache;
          const emojis = guild.emojis.cache;
          const gRoles = guild.roles.cache.sort((a, b) => b.position - a.position).filter(role => role.name !== '@everyone').map(role => role.toString());
          embed
            .setTitle('About Guild')
            .setDescription('Useful information about this server')
            .setThumbnail(guild.iconURL())
            .setImage(guild.bannerURL())
            .addFields(
              {
                name: '> General Info',
                value: stripIndents`
              Name: ${guild.name} (ID: ${guild.id})
              Created: ${time(guild.createdAt)}
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
              Tier: ${levels.premiumTier[guild.premiumTier]}
              Subs: ${guild.premiumSubscriptionCount || '0'}
            `
              },
              {
                name: "> Statistics",
                value: stripIndents`          
              Roles: ${gRoles.length - 1}
              Emojis: ${emojis.size} (${(emojis.filter(emoji => emoji.animated === true).size)} animated, ${(emojis.filter(emoji => emoji.animated === false).size)} normal)
              Channels: ${channels.size} (${channels.filter(channel => channel.type === 'text').size} text, ${channels.filter(channel => channel.type === 'voice').size} voice)
              Members: ${guild.memberCount} (${members.filter(member => !member.user.bot).size} users, ${members.filter(member => member.user.bot).size} bots)
              MFA Level: ${(guild.mfaLevel === 'ELEVATED') ? 'Elevated' : 'None'}
              Verify Level: ${levels.verificationLevel[guild.verificationLevel]}
              Explicit Filter: ${levels.explicitFilterLevel[guild.explicitContentFilter]}
              NSFW Level: ${levels.nsfwLevel[guild.nsfwLevel]}
            `
              },
              {
                name: "> Presences",
                value: stripIndents`
              Online: ${ presences.filter(presence => presence.status === 'online').size || members.filter(member => member.user.presence === 'online')} 
              Idle: ${ presences.filter(presence => presence.status === 'idle').size || members.filter(member => member.user.presence === 'idle')} 
              Do Not Disturb: ${ presences.filter(presence => presence.status === 'dnd').size || members.filter(member => member.user.presence === 'dnd')} 
              Offline: ${ presences.filter(presence => presence.status === 'offline').size || members.filter(member => member.user.presence === 'offline').size}
            `
              },
              {
                name: `> Roles (${gRoles.length - 1} roles)`,
                value: gRoles.join(', ')
              }
            );
          break;
        case 'member':
          const member = data;
          const user = member.user;
          const mRoles = member.roles.cache.sort((a, b) => b.position - a.position).filter(role => role.name !== '@everyone').map(role => role.toString());
          embed
            .setTitle('About Member')
            .setThumbnail(user.displayAvatarURL())
            .setDescription('Provides detailed information about any users in a guild.')
            .addFields(
              {
                name: '> Member Information',
                value: stripIndents`
              Username: ${user.username}#${user.discriminator}
              Nickname: ${member.nickname ? member.nickname : "Not set"}
              Joined: ${time(member.joinedTimestamp)}
              Acc. Age: ${client.utils.accAge(user.createdAt)}
              Roles: ${mRoles.length}
              (${mRoles.length ? mRoles.join(', ') : "None"})
            `
              },
              {
                name: '> User Information',
                value: stripIndents`
              Bot Acc: ${user.bot}              
              Created: ${time(user.createdAt)}
              Status: ${(member.presence) ? member.presence.status : 'unknown'}
              Activity: ${(member.presence) ? member.presence.activities.join('\n') : 'no data'}
            `
              }
            );
          break;
      };
      embed.setTimestamp();
      return embed;
    };
    switch (subcmd) {
      case 'bot':
        data = null;
        type = 'bot';
        break;
      case 'guild':
        data = guild;
        type = 'guild';
        break;
      case 'user':
        data = member;
        type = 'member';
        break;
      default:
        break;
    };
    await interaction.editReply({
      embeds: [await dynamicEmbed(data, type, client)]
    });
  },
};