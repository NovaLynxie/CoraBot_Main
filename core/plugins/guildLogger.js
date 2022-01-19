const logger = require('../utils/winstonLogger.js');
const { calcAccAge } = require('../utils/botUtils');
const { MessageEmbed } = require('discord.js');
const { time } = require('@discordjs/builders');
const { stripIndents } = require('common-tags');
const guildBaseEmbed = new MessageEmbed().setColor('#75e6c4');
async function eventLog(event, guild, params = {}, client) {
  const { logChannels } = await client.settings.guild.get(guild);
  if (!logChannels.eventLogChID) return;
  const { channel, invite, message, oldMessage, newMessage, member, oldMember, newMember, role, oldRole, newRole } = params;
  logger.verbose(`params: ${JSON.stringify(params, null, 2)}`);
  const guildLogEmbed = new MessageEmbed(guildBaseEmbed)
    .setTitle('Event Logged!')
    .setFooter('Bot created and maintained by NovaLynxie.', client.user.displayAvatarURL({ format: 'png' }));
  const hasChanged = (a, b) => a !== b;
  function shortenContents(content) {
    return (content.length > 1024) ? `${content.substr(0, 1021)}...` : content;
  };
  let inviteDetails, memberDetails, memberRoles, messageDetails, messageContents, oldMsgContents, newMsgContents, roleDetails, rolePermsDiff;
  if (invite) {
    inviteDetails = {
      name: 'Invite Details',
      value: stripIndents`        
        Code: ${invite.code}
        User: ${invite.inviter}
        ${(invite.uses) ? `Uses: ${invite.uses}` : ''}
        Max Age: ${(invite.maxAge) ? (invite.maxAge > 0) ? invite.maxAge : 'Infinite' : 'N/A'}
        Max Uses: ${(invite.maxUses) ? (invite.maxUses > 0) ? invite.maxUses : 'Infinite' : 'N/A'}
        Created At ${time(invite.createdAt)}
        Temporary? ${(invite.temporary) ? 'Yes' : 'No'}
        [Invite Link](${invite.url})
      `
    };
  };
  if (member) {
    memberDetails = {
      name: 'Member Details',
      value: stripIndents`
        Name: ${member.user.tag} (${member.user.id})
        Acc. Age: ${client.accAge(member.user.createdAt)}
        Created: ${time(member.user.createdAt)}
        Joined: ${time(member.user.joinedAt)}
      `
    };
  };
  if (oldMember || newMember) {
    const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
    const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
    memberDetails = {
      name: 'Member Updated',
      value: stripIndents`
        ${oldMember.user.tag} >> ${newMember.user.tag}
        ${oldMember.nick} >> ${newMember.nick}
        Avatar changed? ${(hasChanged(oldMember.avatar, newMember.avatar)) ? 'Yes' : 'No'}
        ${(hasChanged(oldMember.avatar, newMember.avatar)) ? `[Old Avatar](${oldMember.displayAvatarURL()}) >> [New Avatar](${newMember.displayAvatarURL()})` : ''}
      `
    };
    memberRoles = {
      name: 'Roles Changed',
      value: stripIndents`
        \`\`\`diff
        ${addedRoles.size > 0 ? addedRoles.map(role => `+ ${role.name}`) : ''}
        ${removedRoles.size > 0 ? removedRoles.map(role => `- ${role.name}`) : ''}        
        \`\`\`
      `
    };
  };
  if (role) {
    roleDetails = {
      name: role.deleted ? 'Role Deleted' : 'Role Created',
      value: stripIndents`
        Name: ${role.name}
        Color: ${role.hexColor}
        ${role.permissions.toArray().length} permissions set.
        Hoisted? ${(role.hoist) ? 'Yes' : 'No'}
        Created at ${time(role.createdAt || new Date(role.createdTimestamp))}
        Deleted? ${(role.deleted) ? 'Yes' : 'No'}
      `
    };
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
        Name: ${(oldRole.name !== newRole.name) ? `~~*${oldRole.name}*~~ >> **${newRole.name}**` : oldRole.name}
        Color: ${(oldRole.hexColor !== newRole.hexColor) ? `**${newRole.hexColor}** (${oldRole.hexColor})` : oldRole.hexColor}
        Show users separately? ${(oldRole.hoist === newRole.hoist) ? `${(oldRole.hoist) ? 'Yes' : 'No'}` : `~~*${(oldRole.hoist) ? 'Yes' : 'No'}*~~ >> **${(newRole.hoist) ? 'Yes' : 'No'}**`}
      `
    };
    rolePermsDiff = {
      name: 'Permissions Changed',
      value: stripIndents`
        \`\`\`diff
        ${addedPerms.length > 0 ? addedPerms.map(permFlag => `+ ${permFlag}`).join('\n') : ''}
        ${removedPerms.length > 0 ? removedPerms.map(permFlag => `- ${permFlag}`).join('\n') : ''}        
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
        Channel: ${newMessage.channel}
        [Go to message](${newMessage.url})
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
  guildLogEmbed
    .setAuthor(newMember ?.user.tag || member ?.user.tag || client.user.tag, newMember ?.displayAvatarURL() || member ?.displayAvatarURL() || client.user.displayAvatarURL() || 'https://via.placeholder.com/128x128?text=avatar')
    .setThumbnail(newMember ?.displayAvatarURL() || member ?.displayAvatarURL() || guild.iconURL() || 'https://via.placeholder.com/128x128?text=guild')
  switch (event) {
    case 'guildMemberAdd':
      guildLogEmbed
        .setDescription(`📥 ${member.user.tag} has joined the server.`)
        .addFields(memberDetails)
      break;
    case 'guildMemberRemove':
      guildLogEmbed
        .setDescription(`📤 ${member.user.tag} has left the server.`)
        .addFields(memberDetails)
      break;
    case 'guildMemberUpdate':
      guildLogEmbed
        .setDescription(`${newMember.user.tag} updated their profile.`)
        .addFields(memberDetails, memberRoles)
      break;
    case 'messageDelete':
      guildLogEmbed
        .setDescription('A message was deleted!')
        .addFields(messageDetails, messageContents)
      break;
    case 'messageUpdate':
      guildLogEmbed
        .setDescription('A message was updated!')
        .addFields(messageDetails, oldMsgContents, newMsgContents)
      break;
    case 'roleCreate':
      guildLogEmbed
        .setDescription('A guild role was created!')
        .addFields(roleDetails)
      break;
    case 'roleDelete':
      guildLogEmbed
        .setDescription('A guild role was removed!')
        .addFields(roleDetails)
      break;
    case 'roleUpdate':
      guildLogEmbed
        .setDescription('A guild role was updated!')
        .addFields(roleDetails, rolePermsDiff)
      break;
    case 'inviteCreate':
      guildLogEmbed
        .setDescription('A new invite was generated!')
        .addFields(inviteDetails)
      break;
    case 'inviteDelete':
      guildLogEmbed
        .setDescription('An existing invite was deleted.')
        .addFields(inviteDetails)
      break;
    default:
      return logger.debug('Unknown or unrecognised event type!');
  };
  try {
    logger.debug('Sending event log to channel now...');
    guild.channels.cache.get(logChannels.botLogChID).send({ embeds: [guildLogEmbed] });
    logger.debug('Event log sent successfully!');
  } catch (err) {
    logger.error('Failed to save event log embed!');
    logger.error(err.message); logger.debug(err.stack);
  };
};
async function modLog(action, guild, params = {}, client) {
  const { channel = undefined, executor, member, reason = 'No reason provided.' } = params, logdate = new Date();
  const { logChannels } = await client.settings.guild.get(guild);
  if (!logChannels.modLogChID) return;
  const guildLogEmbed = new MessageEmbed(guildBaseEmbed)
    .setTitle('Moderation Log')
    .setAuthor(executor.user.tag, executor.displayAvatarURL())
    .setFooter('Bot created and maintained by NovaLynxie.', client.user.displayAvatarURL({ format: 'png' }));
  let memberDetails, executorDetails, actionDetails;
  if (member) {
    memberDetails = {
      name: 'Member Details',
      value: stripIndents`
        Username: ${member.user.tag} (${member})
        Created: ${time(member.user.createdAt)}
        Joined: ${time(member.joinedAt)}`
    };
  };
  if (executor) {
    executorDetails = {
      name: 'Executor Details',
      value: stripIndents`
        Executor: ${executor.user.tag} (${executor})
        Created: ${time(executor.user.createdAt)}
        Joined: ${time(executor.joinedAt)}`
    };
  };
  actionDetails = {
    name: 'Mod Action Details',
    value: stripIndents`
      Mod Action: ${action}
      Log Date: ${time(logdate)}
      **Reason**
      ${(reason) ? reason : 'None provided...'}`
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
        );
      break;
    default:
      return logger.debug('Unknown or unrecognised action called!');
  };
  try {
    logger.debug('Sending moderation log to channel now...');
    guild.channels.cache.get(logChannels.modLogChID).send({ embeds: [guildLogEmbed] });
    logger.debug('Moderation log sent successfully!');
  } catch (err) {
    logger.error('Failed to save moderation log embed!');
    logger.error(err.message); logger.debug(err.stack);
  };
};
async function notifLog(type, guild, params = {}, client) {
  const { /* add params here */ } = params, logdate = new Date();
  const { logChannels } = await client.settings.guild.get(guild);
  if (!logChannels.guildLogChID) return;
  const guildLogEmbed = new MessageEmbed(guildBaseEmbed)
    .setTitle('New Notification! (WIP)')
    .setDescription('Notification logs are still WIP! It may not display data as expected and/or break between updates.')
    .setFooter('Bot created and maintained by NovaLynxie.', client.user.displayAvatarURL({ format: 'png' }));
  // process field data here
  let notifLogFields = [/* add fields here */];
  switch (type) {
    // add events here
    case '':
      break;
    default:
      return logger.debug('Unknown or unrecognised action called!');
  };
  try {
    logger.debug('Sending notification log to channel now...');
    guild.channels.cache.get(logChannels.guildLogChID).send({ embeds: [guildLogEmbed] });
    logger.debug('Notification log sent successfully!');
  } catch (err) {
    logger.error('Failed to save notification log embed!');
    logger.error(err.message); logger.debug(err.stack);
  };
};
module.exports = { eventLog, modLog, notifLog };