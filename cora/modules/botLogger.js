const { MessageEmbed } = require('discord.js');
const logger = require('../providers/WinstonPlugin');
const { stripIndents } = require('common-tags');
const { autoLog } = require('../handlers/bootLoader');
const {
  enableLogger,
  logChannels,
  ignoredChannels,
  messageUpdates,
  userJoinLeaves,
  roleUpdates
} = autoLog;

module.exports = function botLogger(event, data, client) {
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
      logger.error(err)
      logger.debug(err.stack)
    }
  }
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
  function sendLog(guild, embed) {
    logChannels.forEach(channel => {
      let logChannel = guild.channels.cache.get(channel);
      if (logChannel && logChannel !== undefined) {
        logChannel.send(embed);
      };
    });
  }
  if (enableLogger === "yes") {
    logger.verbose('botLogger.checkIfEnabled => true')
    let message = data;
    switch (event) {
      case 'messageDelete':
        logger.debug(`message was deleted -> ${message}`);
        var author = message.author;
        var logEmbed = new MessageEmbed()
          .setTitle('Message Deleted!')
          .setAuthor(author.tag, author.avatarURL())
          .setDescription('A message was deleted in a channel.')
          .addFields(
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
          )
          .setColor(0x00ae86)
          .setTimestamp()
          .setFooter(
            'Bot created and maintained by NovaLynxie.',
            client.user.displayAvatarURL({ format: 'png' })
          );
        var server = client.guilds.cache.get(data.guild.id);
        var logChannel = server.channels.cache.get()
        sendLog(server, logEmbed);
        break;

      case 'messageUpdate':
        var
          oldMessage = data.oldMessage,
          newMessage = data.newMessage;
        var author = oldMessage.author;
        var logEmbed = new MessageEmbed()
          .setTitle('Message Data Updated!')
          .setAuthor(author.tag, author.avatarURL())
          .setDescription('A message was updated in a channel.')
          .addFields(
            {
              name: "Author Details",
              value: stripIndents`
              User Tag: ${author.tag}
              User ID: ${author.id}`
            },
            {
              name: 'Message Before',
              value: (oldMessage) ? oldMessage : 'Not available - Cannot fetch old message contents.'
            },
            {
              name: 'Message After',
              value: (newMessage) ? newMessage : 'Not available'
            }
          )
          .setColor(0x00ae86)
          .setTimestamp()
          .setFooter(
            'Bot created and maintained by NovaLynxie.',
            client.user.displayAvatarURL({ format: 'png' })
          );
        var server = client.guilds.cache.get(newMessage.guild.id);
        sendLog(server, logEmbed);
        break;
        case 'memberUpdate':
        var 
          // Fetch member data from input.
          oldMember = data.oldMember,
          newMember = data.newMember;
          // Save role changes here. 
          removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id)),
          addedRoles = newMember.roles.cache.filter(role=>!oldMember.roles.cache.has(role.id));
        var logEmbed = new MessageEmbed()
          .setTitle('Member Info Updated!')
          .setDescription('A member updated their user data.')
          .addFields(
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
          )
        var server = client.guilds.cache.get(newMember.guild.id);
        sendLog(server, logEmbed);
        break;
        case 'userUpdate':
        var 
          // Fetch user data from input.
          oldUser = data.oldUser,
          newUser = data.newUser;
        var logEmbed = new MessageEmbed()
          .setTitle('Member Info Updated!')
          .setDescription('A user updated their profile.')
          .addFields(
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
          )
        var server = client.guilds.cache.get(newMember.guild.id);
        sendLog(server, logEmbed);
        break;
      default: 
      // these will not show in production mode unless logLevel=debug is included in process.env variables.
        logger.debug(`event ${event} not found in case states!`);
        logger.debug(`logged message data may have been lost.`)
    }
  } else {
    logger.verbose('botLogger.checkIfEnabled => false')
  }
};