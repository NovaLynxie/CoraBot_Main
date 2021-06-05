const {assets} = require('../handlers/bootLoader');
const {activities} = assets;
const logger = require('../providers/WinstonPlugin');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    // Announce when client is connected and ready.
    logger.info(`Logged in as ${client.user.tag}!`);
    logger.data(`Bot User ID: ${client.user.id}`);
    client.user.setActivity('with Commando');
    // Spin up built-in server once client is online and ready.
    require('../internal/websrv'); 
    // Setup interval timers to update status and database.
    setInterval(async () => {    
      // status updater
      logger.verbose("ran task update_status")
      const index = Math.floor(Math.random() * (activities.length - 1) + 1);
      if (index >= 0 && index <= 1) {
        var statusType = 1 // 1 - Playing
      };
      if (index >= 2 && index <= 3) {
        var statusType = 2 // 2 - Listening
      };
      if (index >= 4 && index <= 5) {
        var statusType = 3 // 3 - Watching
      };
      client.user.setActivity(activities[index], {type: statusType});
      logger.verbose(`Updated status to activity ${index} of ${activities.length-1}`)
    }, 300000);
    // Database checks for guilds with no configured settings.
    logger.debug('Waiting 3 seconds before starting database checks.');
    setTimeout(() => {
      logger.warn('Running database checks. This may take a bit.');
      logger.debug("Checking all bot's connected guilds now...")
      let guildsChecked = 0, guildsConfigured = 0;
      const Guilds = client.guilds.cache.map(guild => guild);
      Guilds.forEach(guild => {
        // Increase counter by one for each connected guild checked.
        guildsChecked++;
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
          }); 
          logger.debug('Finished checking connected guilds.');
          logger.debug(`Checked ${guildsChecked} guilds and configured ${guildsConfigured}.`);
        } else {
          // Do not override the current configuration if settings are defined.
          logger.debug('Finished checking connected guilds.');
          logger.debug('No new guild configurations needed.');
        };        
      });
      logger.info('Database checks finished, ready for use.');
    }, 3000);
  },
};