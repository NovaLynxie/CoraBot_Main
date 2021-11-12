const logger = require('../utils/winstonLogger.js');
const { calculateAccountAge } = require('../utils/botUtils');
const { MessageEmbed } = require('discord.js');
const { time } = require('@discordjs/builders');
const { stripIndents } = require('common-tags');
const guildBaseEmbed = new MessageEmbed()
  .setColor('#75e6c4');
async function eventLog(event, guild, channel, params = {}, client) {
  const { logChannels } = await client.settings.guild.get(guild);
  const { message, oldMessage, newMessage, member, oldMember, newMember } = params;
  const guildLogEmbed = new MessageEmbed(guildBaseEmbed)
    .setTitle('Event Log')
    .setFooter('Bot created and maintained by NovaLynxie.', client.user.displayAvatarURL({ format: 'png' }));
  const hasChanged = (a, b) => a === b;
  const shortenContents = (msg) => msg.length > 100 ? `${msg.content.substr(0, 97)}...` : msg.content;
  let memberDetails, messageDetails, messageContents, oldMsgContents, newMsgContents;
  if (member) {
    memberDetails = {
      name: 'Member Details',
      value: stripIndents`
        Name: ${member.user.tag} (${member.user.id})
        Acc. Age: ${calculateAccountAge(member.user.createdAt)}
        Created: ${time(member.user.createdAt)}
        Joined: ${time(member.user.joinedAt)}
      `
    };
  };
  if (oldMember || newMember) {
    memberDetails = {
      name: 'Member Updated',
      value: stripIndents`
        ${oldMember.user.tag} >> ${newMember.user.tag}
        ${oldMember.nick} >> ${newMember.nick}
        Avatar changed? ${(hasChanged(oldMember.avatar, newMember.avatar)) ? 'Yes' : 'No'}
      `
    };
  };
  if (message) {
    messageDetails = {
      name: 'Message Deleted',
      value: stripIndents`
        Created: ${time(new Date(message.timestamp))}
        Edited: ${time(new Date(message.editedTimestamp))}
        Author: ${message.author}
      `
    };
    messageContents = {
      name: 'Message Content', value: shortenContents(message.content)
    };
  };
  if (oldMessage || newMessage) {
    messageDetails = {
      name: 'Message Updated',
      value: stripIndents`
        Created: ${time(new Date(newMessage.timestamp))}
        Edited: ${time(new Date(newMessage.editedTimestamp))}
        Author: ${newMessage.author}
      `
    };
    oldMsgContents = {
      name: 'Old Message', value: shortenContents(oldMessage.content)
    };
    newMsgContents = {
      name: 'New Message', value: shortenContents(newMessage.content)
    };
  };
  switch (event) {
    case 'guildMemberAdd':
      guildLogEmbed
        .setDescription('User joined the server!')
        .setThumbnail(member.avatarURL())
        .addFields(memberDetails)
      break;
    case 'guildMemberRemove':
      guildLogEmbed
        .setDescription('User left the server!')
        .addFields(memberDetails)
      break;
    case 'guildMemberUpdate':
      guildLogEmbed
        .setDescription('User joined the server!')
        .setThumbnail(newMember.displayAvatarURL())
        .addFields(memberDetails)
      break;
    case 'messageDelete':
      guildLogEmbed
        .setDescription('A message was deleted!')
        .setThumbnail(member.displayAvatarURL())
        .addFields(messageDetails, messageContents)
      break;
    case 'messageUpdate':
      guildLogEmbed
        .setDescription('A message was updated!')
        .setThumbnail(member.displayAvatarURL())
        .addFields(messageDetails, oldMsgContents, newMsgContents)
      break;
    default:
    // ..
  }
  try {
    logger.debug('Sending moderation log to channel now...');
    let modLogChannel = guild.channels.cache.get(logChannels.modLogChID);
    modLogChannel.send({ embeds: [guildLogEmbed] });
    logger.debug('Moderation log sent successfully!');
  } catch (err) {
    logger.error('Failed to save moderation log embed!');
    logger.error(err.message); logger.debug(err.stack);
  };
}

async function modLog(action, params = {}, client) {
  const executor = params ?.executor, member = params ?.member;
  const channel = params ?.channel ? params.channel : undefined;
  const guild = executor.guild, logdate = new Date();
  const reason = (params ?.reason) ? params.reason : 'No reason provided.';
  const { logChannels } = await client.settings.guild.get(guild);
  const guildLogEmbed = new MessageEmbed(guildBaseEmbed)
    .setTitle('Moderation Log')
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
module.exports = { modLog, eventLog };