const logger = require('./winstonLogger');
const { MessageEmbed } = require('discord.js');
const { time } = require('@discordjs/builders');
const { stripIndents } = require('common-tags');

async function guildLogger(action, params = {}, client) {
  const executor = params ?.executor, member = params ?.member;  
  const channel = params ?.channel ? params.channel : undefined;
  const guild = executor.guild, logdate = new Date();
  const reason = (params ?.reason) ? params.reason : 'No reason provided.';
  const settings = await client.settings.guild.get(guild);
  const { logChannels } = settings;
  const guildLogEmbed = new MessageEmbed()
    .setTitle('Moderation Action Logged!')
    .setFooter('Bot created and maintained by NovaLynxie.', client.user.displayAvatarURL({ format: 'png' }));
  let memberDetails, executorDetails, actionDetails;
  if (member) {
    memberDetails = {
      name: 'Member Details',
      value: stripIndents`
        Username: ${member.user.tag} (${member.displayName})
        Created: ${time(member.user.createdAt)}
        Joined: ${time(member.joinedAt)}`
    };
  };
  if (executor) {
    executorDetails = {
      name: 'Executor Details',
      value: stripIndents`
        Executor: ${executor.user.tag} (${executor.displayName})
        Created: ${time(executor.user.createdAt)}
        Joined: ${time(executor.joinedAt)}`
    }
  };
  actionDetails = {
    name: 'Action Details',
    value: stripIndents`
      Log Date: ${time(logdate)}
      __**Reason**__
      ${reason}`
  };
  let modLogFields = [memberDetails, executorDetails, actionDetails];
  switch (action) {
    case 'ban':
      guildLogEmbed
        .setColor('#e8411c')
        .setDescription('🔨 The ban hammer has spoken.')
        .addFields(modLogFields)
        break;
    case 'kick':
      guildLogEmbed
        .setColor('#e8411c')
        .setDescription('👢 A magical boot gives them a swift kick.')
        .addFields(modLogFields)
        break;
    case 'mute':
      guildLogEmbed
        .setColor('#e8a11c')
        .setDescription('🤐 Silence you fool!')
        .addFields(modLogFields)
        break;
    case 'warn':
      guildLogEmbed
        .setColor('#e8bc1c')
        .setDescription('⚠️ Issued a warning this time.')
        .addFields(modLogFields)
        break;
    case 'clear':
      const messages = (params ?.messages) ? params.messages : undefined;
      const amount = (params ?.amount) ? params.amount : NaN;
      guildLogEmbed
        .setColor('#4bdb23')
        .setDescription('🧹 Sweeping away old messages.')
        .addFields(
          {
            name: 'Message Cleaner',
            value: stripIndents`
              Removed ${messages.size} messages from channel ${(channel) ? channel : '#unknown-channel'}
              Cleaner run by ${executor} on ${time(new Date())}.
              `
          }
        )
      break;
    default:
      // ..
  };
  try {
    logger.debug('Sending moderation log to channel now...');
    let modLogChannel = guild.channels.cache.get(logChannels.modLogChID);
    modLogChannel.send({ embeds: [guildLogEmbed] });
    logger.debug('Moderation log sent successfully!');
  } catch (err) {
    logger.error('Failed to save moderation log embed!');
    logger.error(err.message); logger.debug(err.stack);
  };
};
module.exports = guildLogger
//module.exports = { modLog, eventLog };