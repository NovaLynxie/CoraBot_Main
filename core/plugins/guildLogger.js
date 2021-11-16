const logger = require('../utils/winstonLogger.js');
const { calculateAccountAge } = require('../utils/botUtils');
const { MessageEmbed } = require('discord.js');
const { time } = require('@discordjs/builders');
const { stripIndents } = require('common-tags');
const guildBaseEmbed = new MessageEmbed()
  .setColor('#75e6c4');
async function eventLog(event, guild, params = {}, client) {
  const { logChannels } = await client.settings.guild.get(guild);
  const { channel, message, oldMessage, newMessage, member, oldMember, newMember, role, oldRole, newRole } = params;
  const guildLogEmbed = new MessageEmbed(guildBaseEmbed)
    .setTitle('Event Logged!')
    .setFooter('Bot created and maintained by NovaLynxie.', client.user.displayAvatarURL({ format: 'png' }));
  const hasChanged = (a, b) => a === b;
  function shortenContents(content) {
    return (content.length > 1024) ? `${content.substr(0, 1021)}...` : content;
  };
  let memberDetails, messageDetails, messageContents, oldMsgContents, newMsgContents, roleDetails, rolePermsDiff;
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
  if (role) {
    roleDetails = {};
    if (!role.deleted) {
      roleDetails.name = 'Role Created';
    };
    if (role.deleted) {
      roleDetails.name = 'Role Deleted';
    };
    roleDetails.value = stripIndents`
      Name: ${role.name}
      Color: ${role.hexColor}
      ${role.permissions.toArray().length} permissions set.
      Hoisted? ${(role.hoist) ? 'Yes' : 'No'}
      Created at ${time(role.createdAt || new Date(role.createdTimestamp))}
      Deleted? ${(role.deleted) ? 'Yes' : 'No'}
    `
  };
  if (oldRole || newRole) {
    const oldRolePerms = oldRole.permissions.toArray();
    const newRolePerms = newRole.permissions.toArray();
    let addedPerms = [], removedPerms = [];
    oldRolePerms.forEach(permFlag => {
      if (newRolePerms.indexOf(permFlag) <= -1) removedPerms.push(permFlag);
    });
    newRolePerms.forEach(permFlag => {
      if (oldRolePerms.indexOf(permFlag) <= -1) addedPerms.push(permFlag);
    });
    roleDetails = {
      name: 'Role Updated',
      value: stripIndents`
        Name: ${(oldRole.name !== newRole.name) ? `**${newRole.name}** >> ~~*${oldRole.name}*~~` : oldRole.name}
        Color: ${(oldRole.hexColor !== newRole.hexColor) ? `**${newRole.hexColor}** (${oldRole.hexColor})` : oldRole.hexColor}
        Show users separately? ${(oldRole.hoist === newRole.hoist) ? `${(oldRole.hoist) ? 'Yes' : 'No'}` : `~~*${(oldRole.hoist) ? 'Yes' : 'No'}*~~ >> **${(newRole.hoist) ? 'Yes' : 'No'}**`}
      `
    };
    rolePermsDiff = {
      name: 'Permissions Changed',
      value: stripIndents`
        \`\`\`diff
        Removed Permissions
        ${removedPerms.length > 0 ? removedPerms.map(permFlag => `- ${permFlag}`).join('\n') : '~ None'}
        Added Permissions
        ${addedPerms.length > 0 ? addedPerms.map(permFlag => `+ ${permFlag}`).join('\n'): '~ None'}
        \`\`\`
      `
    };
  };
  if (message) {    
    messageDetails = {
      name: 'Message Deleted',
      value: stripIndents`
        Created: ${time(message.createdAt || new Date(message.createdTimestamp))}
        Edited: ${(message.editedAt || message.editedTimestamp) ? `${time(message.editedAt || new Date(message.editedTimestamp))}` : 'Not Edited!'}
        Author: ${message.author}
      `
    };
    messageContents = {
      name: 'Message Contents',
      value: message.content ? shortenContents(message.content) : 'Message content not available!' 
    };
  };
  if (oldMessage || newMessage) {
    messageDetails = {
      name: 'Message Updated',
      value: stripIndents`
        Created: ${time(newMessage.createdAt || new Date(newMessage.createdTimestamp))}
        Edited: ${time(newMessage.editedAt || new Date(newMessage.editedTimestamp))}
        Author: ${newMessage.author}
      `
    };
    oldMsgContents = {
      name: 'Old Message',
      value: (oldMessage.content) ? shortenContents(oldMessage.content) : 'Message content not available!'
    };
    newMsgContents = {
      name: 'New Message',
      value: (newMessage.content) ? shortenContents(newMessage.content) : 'Message content not available!'
    };
  };  
  switch (event) {
    case 'guildMemberAdd':
      guildLogEmbed
        .setDescription(`📥 ${member.user.tag} has joined the server.`)
        .setThumbnail(member.avatarURL())
        .addFields(memberDetails)
      break;
    case 'guildMemberRemove':
      guildLogEmbed
        .setDescription(`📤 ${member.user.tag} has left the server.`)
        .addFields(memberDetails)
      break;
    case 'guildMemberUpdate':
      guildLogEmbed
        .setDescription(`${member.user.tag} updated their profile.`)
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
    case 'roleCreate':
      guildLogEmbed
        .setDescription('A guild role was created!')
        .setThumbnail(guild.iconURL())
        .addFields(roleDetails)
      break;
    case 'roleDelete':
      guildLogEmbed
        .setDescription('A guild role was removed!')
        .setThumbnail(guild.iconURL())
        .addFields(roleDetails)
      break;
    case 'roleUpdate':
      guildLogEmbed
        .setDescription('A guild role was updated!')
        .setThumbnail(guild.iconURL())
        .addFields(roleDetails, rolePermsDiff)
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