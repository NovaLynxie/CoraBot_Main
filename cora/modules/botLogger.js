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

module.exports = function botLogger(event, message, client) {
  if (message.oldMessage || message.newMessage) {
    try {
      logger.data(`channelID:${message.oldMessage.channel.id}`);
      logger.data(`channelID:${message.newMessage.channel.id}`);
      if (ignoredChannels.indexOf(message.newMessage.channel.id) !== -1) {
        logger.debug('Channel is blacklisted from logs! Silently ignored to prevent log spam.');
        return;
      };
      if (logChannels.indexOf(message.newMessage.channel.id) !== -1) {
        logger.debug('Channel is a bot logging channel! Silently ignored to prevent looping.');
        return;
      };
    } catch (err) {
      logger.warn(`Missing arg oldMessage/newMessage! Data is either malformed or missing.`)
      logger.error(err)
      logger.debug(err.stack)
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
              name: "Author Details",
              value: stripIndents`
              User Tag: ${author.tag}
              User ID: ${author.id}`
            },
            {
              name: 'Deleted Message',
              value: (message) ? message : 'Not available.'
            }
          )
          .setColor(0x00ae86)
          .setTimestamp()
          .setFooter(
            'Bot created and maintained by NovaLynxie.',
            client.user.displayAvatarURL({ format: 'png' })
          );
        var server = client.guilds.cache.get(message.guild.id);
        var logChannel = server.channels.cache.get()
        sendLog(server, logEmbed);
        break;

      case 'messageUpdate':
        var
          oldMessage = message.oldMessage,
          newMessage = message.newMessage;
        var author = oldMessage.author;
        var logEmbed = new MessageEmbed()
          .setTitle('Message Updated!')
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
      default: 
      // these will not show in production mode unless logLevel=debug is included in process.env variables.
        logger.debug(`event ${event} not found in case states!`);
        logger.debug(`logged message data may have been lost.`)
    }
  } else {
    logger.verbose('botLogger.checkIfEnabled => false')
  }
};