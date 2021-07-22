const { MessageEmbed } = require('discord.js');
const moment = require('moment'); require('moment-timezone');
const logger = require('../providers/WinstonPlugin');
const { stripIndents } = require('common-tags');

module.exports = async function botLogger(event, data, client) {
  // Fetch settings from guild settings provider, client settings provider is not used.
  let guild = client.guilds.cache.get(data.newMember.guild.id) || client.guilds.cache.get(data.newMessage.guild.id) || client.guilds.cache.get(data.guild.id);
  let botLoggerSettings = guild.settings.get('botlogger', undefined);
  let { enableBotLogger, logChannels, ignoredChannels, messageUpdates, userJoinLeaves, userUpdates, memberUpdates } = botLoggerSettings;  
  // Check if either oldMessage OR newMessage is defined then process it.
  if (data.oldMessage || data.newMessage) {
    try {
      logger.data(`channelID:${data.oldMessage.channel.id}`);
      logger.data(`channelID:${data.newMessage.channel.id}`);
      if (ignoredChannels.indexOf(data.newMessage.channel.id) !== -1) {
        logger.debug('Channel is blacklisted from logs! Silently ignored to prevent log spam.');
        return;
      };
      if (logChannels.indexOf(data.newMessage.channel.id) !== -1) {
        logger.debug('Channel is a bot logging channel! Silently ignored to prevent looping.');
        return;
      };
    } catch (err) {
      logger.warn(`Missing arg oldMessage/newMessage! Data is either malformed or missing.`)
      logger.error(err.message);
      logger.debug(err.stack);
    }
  }
  // Check if either oldMember OR newMember is defined then process it.
  if (data.oldMember || data.newMember) {
    try {
      logger.data(`username: ${data.oldMember.username} => ${data.newMember.username}`)
      logger.data(`discriminator: ${data.oldMember.discriminator} => ${data.newMember.discriminator}`)
    } catch (err) {
      logger.error(`Error! ${err}`)
      logger.warn('It appears some data is missing from member objects.');
      logger.warn('Attempting to process incomplete information may cause unusual errors.');
    }
  }
  if (data.member) {
    try {
      logger.data(`usertag: ${data.member.user.tag}`);
      logger.data(`userid: ${data.member.user.id}`);
    } catch (err) {
      logger.warn(`Data is not a valid GuildMember object!`)
      logger.error(err.message);
      logger.debug(err.stack);
    }
  }
  function sendLog(guild, embed) {
    // Check first if any log channels are set, warn if none are available.
    if (logChannels.length <= 0) {
      logger.debug(`No log channel set for ${guild.name}!`);
      logger.debug(`Log data not sent due to no channels configured.`)
      return;
    };
    logChannels.forEach(channel => {
      let logChannel = guild.channels.cache.get(channel);
      if (logChannel && logChannel !== undefined) {
        logChannel.send(embed);
      };
    });
  }
  if (enableBotLogger) {
    logger.verbose('botLogger.checkIfEnabled => true')
    let message = data; var logEmbed = {
      color: 0x00ae86,
      title: 'logEmbed.title.placeholder',
      description: 'logEmbed.desc.placeholder',
      thumbnail: {},
      fields: [],
      timestamp: new Date(),
      footer: {
        text: 'Bot created and maintained by NovaLynxie.',
        icon_url: client.user.displayAvatarURL({ format: 'png' }),
      },
    };

    switch (event) {
      case 'messageDelete':
        // If disabled, stop here. Otherwise continue.
        if (!messageUpdates) break;
        logger.debug(`message was deleted -> ${message}`);
        // Fetch message author from message object.
        var author = message.author;
        // Set field values to update embed object.
        var title = 'Message Deleted Notification!';
        var desc = 'A message was deleted in a channel in this guild.';
        var fields = [
          {
              name: "Message Author Details",
              value: stripIndents`
              User Tag: ${author.tag}
              User ID: ${author.id}`
          },
          {
            name: 'Deleted Message Contents',
            value: (message.content) ? message.content : 'Not available.'
          }
        ];
        fields.forEach(obj => {
          logEmbed.fields.push(obj);
        });
        var server = client.guilds.cache.get(data.guild.id);
        sendLog(server, logEmbed);
        break;

      case 'messageUpdate':
        // If disabled, stop here. Otherwise continue.
        if (!messageUpdates) break;
        // Fetch necessary information from the 'data' parameter.
        var
          oldMessage = data.oldMessage,
          newMessage = data.newMessage;
        var author = oldMessage.author;
        // Set field values to update embed object.
        var title = 'Message Deleted Notification!';
        var desc = 'A message was deleted in a channel in this guild.';
        var fields = [
          {
              name: "Message Author Details",
              value: stripIndents`
              User Tag: ${author.tag}
              User ID: ${author.id}`
          },
          {
            name: 'Deleted Message Contents',
            value: (message.content) ? message.content : 'Not available.'
          }
        ];
        fields.forEach(obj => {
          logEmbed.fields.push(obj);
        });
        var server = client.guilds.cache.get(newMessage.guild.id);
        sendLog(server, logEmbed);
        break;
      case 'guildMemberAdd':
        // If disabled, stop here. Otherwise continue.
        if (!userJoinLeaves) break;
        // Fetch member data from input.
        member = data.member;
        // Prepare new field data for embed object.
        var title = 'Guild Member Joined!';
        var desc = 'A new member has joined your guild.';
        var fields = [
          {
            name: "Member Information",
            value: stripIndents`
            Username: ${member.user.tag}
            Joined ${moment().format('DDD-MMM-YYYY HH:MM:SS-ZZZ')}
            Acc. Age: ${Date.now() - member.user.createdAt() /1000/60/60/24} days`
          }
        ];
        fields.forEach(obj => {
          logEmbed.fields.push(obj);
        });
        var server = client.guilds.cache.get(newMember.guild.id);
        sendLog(server, logEmbed);
        break;
      case 'guildMemberRemove':
        // If disabled, stop here. Otherwise continue.
        if (!userJoinLeaves) break;
        // Fetch member data from input.
        member = data.member;
        // Prepare new field data for embed object.
        var title = 'Guild Member Left!';
        var desc = 'A member just left your guild.';
        var fields = [
          {
            name: "Member Information",
            value: stripIndents`
            Username: ${member.user.tag}
            Joined ${moment().format('DDD-MMM-YYYY HH:MM:SS-ZZZ')}`
          }
        ];
        fields.forEach(obj => {
          logEmbed.fields.push(obj);
        });
        var server = client.guilds.cache.get(newMember.guild.id);
        sendLog(server, logEmbed);
        break;
      case 'guildMemberUpdate':
        // If disabled, stop here. Otherwise continue.
        if (!memberUpdates) break;
        var 
          // Fetch member data from input.
          oldMember = data.oldMember,
          newMember = data.newMember;
          // Save role changes here. 
          removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id)),
          addedRoles = newMember.roles.cache.filter(role=>!oldMember.roles.cache.has(role.id));
        // Set field values to update embed object.
        var title = 'Guild Member Updated!';
        var desc = 'A member has updated their identity in your guild.';
        var fields = [
          {
            name: "Old Member Data",
            value: stripIndents`
            Nickname: ${oldMember.displayName}
            Roles Removed:
            ${removedRoles.map(r=>r.name)}`
          },
          {
            name: "New Member Data",
            value: stripIndents`
            Nickname: ${newMember.displayName}
            Roles Added:
            ${addedRoles.map(r=>r.name)}`
          }
        ];
        fields.forEach(obj => {
          logEmbed.fields.push(obj);
        });
        var server = client.guilds.cache.get(newMember.guild.id);
        sendLog(server, logEmbed);
        break;
      case 'userUpdate':
        // If disabled, stop here. Otherwise continue.
        if (!userUpdates) break;
        var 
          // Fetch user data from input.
          oldUser = data.oldUser,
          newUser = data.newUser;
        // Set field values to update embed object.
        var title = 'User Data Updated!';
        var desc = 'A user has updated their profile information.';
        var fields = [
          {
            name: "Old User Data",
            value: stripIndents`
            Username: ${oldUser.username}
            Discriminator: ${oldUser.discriminator}
            Old Avatar
            ${oldUser.avatarURL({format:'png'})}`
          },
          {
            name: "New User Data",
            value: stripIndents`
            Username: ${newUser.username}
            Discriminator: ${newUser.discriminator}
            New Avatar
            ${newUser.avatarURL({format:'png'})}`
          }
        ];
        fields.forEach(obj => {
          logEmbed.fields.push(obj);
        });
        var server = client.guilds.cache.get(newMember.guild.id);
        sendLog(server, logEmbed);
        break;
      default: 
      // these will not show in production mode unless logLevel=debug is included in process.env variables.
        logger.debug(`event ${event} not found in case states!`);
        logger.debug(`logged message/user data may have been lost.`)
    }
  } else {
    logger.verbose('botLogger.checkIfEnabled => false')
  }
};