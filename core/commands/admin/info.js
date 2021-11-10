const logger = require('../../plugins/winstonLogger');
const locales = require('../../assets/resources/localeCodes.json');
const { SlashCommandBuilder, time } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');

async function dynamicEmbed (data, type, client) {
  const embed = new MessageEmbed();
  switch (type) {
    case 'bot':
      client.application = await client.application.fetch();
      embed
        .setTitle('About Bot')
        .setDescription(client.application.description);
      break;
    case 'guild':
      const guild = data;
      const roles = message.guild.roles.cache.sort((a, b) => b.position - a.position).map(role => role.toString());
      const members = message.guild.members.cache;
      const channels = message.guild.channels.cache;
      const emojis = message.guild.emojis.cache;
      embed
        .setTitle('About Guild')
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
        );
      break;
    case 'member':
      const member = data;
      const user = member.user;
      embed
        .setTitle('About Member')
        .setDescription('Provides detailed information about any users in a guild.')
        .addFields(
          {
            name: '> Member Information',
            value: stripIndents`
              Username: ${user.username}#${user.discriminator}
              Nickname: ${member.nickname ? member.nickname : "N/A"}
              Joined: ${time(member.joinedTimestamp)}
              Roles: ${roles.length}
              (${roles.length ? roles.join(', ') : "None"})
            `
          },
          {
            name: '> User Information',
            value: stripIndents`
              Bot Acc: ${user.bot}
              Created: ${moment.utc(user.createdAt).format('dddd, MMMM Do YYYY, HH:mm:ss Z')}
              Status: ${(member.presence) ? member.presence.status : 'unknown'}
              Activity: ${(member.presence) ? member.presence.activities.join('\n') : 'no data'}
            `
          }
        );
      break;
    default:
      // ..
  };  
  embed.setTimestamp();
  return embed;
};

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
        type = 'user';
        break;
      default:
        break;
    };
    await interaction.editReply({
      embeds: [dynamicEmbed(data, type, client)]
    });
	},
};