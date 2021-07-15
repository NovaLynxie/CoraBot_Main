const logger = require('../providers/WinstonPlugin');
const fs = require('fs');

module.exports = {
  name: 'guildCreate',
  execute(guild, client) {
    logger.info(`${client.user.tag} joined ${guild.name}. Running settings check.`);
    logger.debug(`Joined ${guild.name} (${guild.id}) Preparing to create settings.`);
    let 
      announcerSettings = guild.settings.get('announcer', undefined),
      autoModSettings = guild.settings.get('automod', undefined),
      chatBotSettings = guild.settings.get('chatbot', undefined),
      botLogSettings = guild.settings.get('botlogger', undefined),
      modLogSettings = guild.settings.get('modlogger', undefined);
    // Check if these settings are defined using falsy checks.
    if (!announcerSettings||!autoModSettings||!chatBotSettings||!botLogSettings||!modLogSettings) {
      // If they are not configured, setup with default settings.
      // Fetch Settings Template from ./cora/assets/text/
      let settingsTemplate = fs.readFileSync('./cora/assets/text/defaultSettings.txt', 'utf-8');
      // Attempt to parse to a usable Array of objects.
      let defaultSettings = JSON.parse("[" + settingsTemplate + "]");
      // Apply default settings using guild as reference for configuration.
      defaultSettings.forEach(setting => {
        logger.data(`Generating setting ${setting.name} for ${guild.name}`)
        guild.settings.set(setting.name, setting.value).then(logger.debug(`Saved ${setting.name} under ${guild.name}`));
      }); 
      logger.debug('Successfully generated settings for guild ${guild.name} (${guild.id}).');
    } else {
      // Do not override the current configuration if settings are defined.
      logger.warn(`${guild.name} seems to already have been configured!`);
      logger.debug(`${guild.name} (${guild.id}) already has a configuration!`);
      logger.debug('No new guild configurations were generated.');
    };
  }
}