const logger = require('../providers/WinstonPlugin');

module.exports = {
  name: 'guildCreate',
  execute(guild, client) {
    let 
      announcerSettings = guild.settings.get('announcer', undefined),
      autoModSettings = guild.settings.get('automod', undefined),
      chatBotSettings = guild.settings.get('chatbot', undefined),
      botLogSettings = guild.settings.get('botlogger', undefined),
      modLogSettings = guild.settings.get('modlogger', undefined);
    // Check if these settings are defined using falsy checks.
    if (!announcerSettings||!autoModSettings||!chatBotSettings||!botLogSettings||!modLogSettings) {
      // If they are not configured, setup with default settings.
      // Increase counter by one for each new guild configuration.
      guildsConfigured++; 
      let defaultSettings = [
        {
          name: 'announcer',
          value: {
            enableNotifier: false,
            events: {
              join: false,
              leave: false,
              kick: false,
              ban: false
            },
            eventMessages: {
              userJoin: '<user> has joined the server.',
              userLeave: '<user> has left the server.',
              userKick: '<user> was kicked from the server.',
              userBan: '<user> was banned from the server.'
            }
          }
        },        
        {
          name: 'automod',
          value: {
            enableAutoMod: false,
            chListMode: 'whitelist',
            channelsList: [],
            urlBlackList: [],
            mediaOptions: {
              removeGifs: false,
              removeImgs: false,
              removeUrls: false
            }
          }
        },        
        {
          name: 'chatbot',
          value: {
            enableAutoChat: false,
            chatChannels: []
          }
        },
        {
          name: 'botlogger',
          value: {
            enableBotLogger: false,
            logChannels: [],
            ignoreChannels: [],
            logEvents: {
              messageUpdates: true,
              userJoinLeave: true,
              userRoleUpdate: true
            }
          }
        },
        {
          name: 'modlogger',
          value: {
            enableModLogger: false,
            logChannels: [],
            ignoreChannels: [],
            logEvents: {
              guildMemberRemove: true
            }
          }
        }
      ];
      // Apply default settings using guild as reference for configuration.
      defaultSettings.forEach(setting => {
        logger.data(`Generating setting ${setting.name} for ${guild.name}`)
        guild.settings.set(setting.name, setting.value).then(logger.debug(`Saved ${setting.name} under ${guild.name}`));
      }).then(() => {
        logger.info(`Configured ${guild.name}`)
        logger.debug(`Added configuration for ${guild.name} with unique ID ${guild.id}.`)
      }); 
    } else {
      // Do not override the current configuration if settings are defined.
      logger.warn(`${guild.name} seems to already have been configured!`);
      logger.debug(`${guild.name} already has a configuration!`);
      logger.debug('No new guild configurations needed.');
    };
  }
}