const {assets, config} = require('../handlers/bootLoader');
const {activities} = assets, {debug, enableDash, dashSrvPort, reportOnly} = config;
const logger = require('../providers/WinstonPlugin');
const fs = require('fs');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    // Announce when client is connected and ready.
    logger.info(`Logged in as ${client.user.tag}!`);
    logger.data(`Bot User ID: ${client.user.id}`);
    client.user.setActivity('with Commando');
    client.application = await client.fetchApplication();
    logger.debug('Preparing database checks...');
    setTimeout(() => {
      // Database checks for guilds with no configured settings.
      logger.warn('Running guild settings checks. This may take a bit.');
      logger.debug("Checking all bot's connected guilds now...");
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
          // Fetch Settings Template from ./cora/assets/text/
          let settingsTemplate = fs.readFileSync('./cora/assets/text/guildDefaultSettings.txt', 'utf-8');
          // Attempt to parse to a usable Array of objects.
          let defaultSettings = JSON.parse("[" + settingsTemplate + "]");
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
    }, 1000);
        
    // Spin up built-in server once client is online and ready.
    const dashConfig = {
      "debug": debug, // used to enable debug console log data.
      "dashPort": dashSrvPort,
      "reportOnly": reportOnly,
      "clientID" : client.application.id,
      "oauthSecret" : process.env.clientSecret,
      "sessionSecret" : process.env.sessionSecret,
      "botDomain" : process.env.botDomain || botDomain,
      "callbackURL" : process.env.callbackURL || callbackURL
    };
    try {
      logger.verbose(`enableDash=${enableDash}`);
      if (enableDash) {
        logger.debug('Initialising dashboard service.');
        require('../dashboard/dashsrv.js')(client, dashConfig);
      }
    } catch (err) {
      // fallback to websrv silently if fails.
      logger.error('Dashboard service failed to start!');
      logger.warn('Dashboard cannot be loaded. Report this to the developers!');
      logger.debug(err.stack);
      require('../internal/websrv.js');
    };
    
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
  },
};