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
    // Run this after bot starts.
    logger.debug('Waiting 5 seconds before running database checks.');
    setTimeout(() => {
      logger.debug('Checking all connected guilds now...')
      let guildsChecked = 0, guildsConfigured = 0;
      const Guilds = client.guilds.cache.map(guild => guild);
      Guilds.forEach(guild => {
        // increase counter by one for each connected guild checked.
        guildsChecked++;
        let 
          announcerSettings = guild.settings.get('announcer', undefined),
          autoModSettings = guild.settings.get('automod', undefined),
          chatBotSettings = guild.settings.get('chatbot', undefined),
          botLogSettings = guild.settings.get('botlogger', undefined),
          modLogSettings = guild.settings.get('modlogger', undefined);
        
        if (!announcerSettings||!autoModSettings||!chatBotSettings||!botLogSettings||!modLogSettings) {
          // increase counter by one for each new guild configuration.
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
          ]
          defaultSettings.forEach(setting => {
            logger.data(`Generating setting ${setting.name} for ${guild.name}`)
            guild.settings.set(setting.name, setting.value).then(logger.debug(`Saved ${setting.name} under ${guild.name}`));
          }).then( () => {
            logger.info('Database checks finished, ready for use.')
            logger.debug('Finished checking connected guilds.')
            logger.debug(`Checked ${guildsChecked} guilds and configured ${guildsConfigured}.`)
          }); 
        } else {
          logger.debug('Finished checking connected guilds.');
          logger.debug('No new guild configurations needed.');
        };
      });
    }, 5000);
  },
};