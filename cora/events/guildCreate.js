const logger = require('../providers/WinstonPlugin');
const fs = require('fs');

module.exports = {
  name: 'guildCreate',
  execute(guild, client) {
    logger.info(`${client.user.tag} joined ${guild.name}!`);
    logger.debug(`Joined ${guild.name} (${guild.id}) Preparing to create settings.`);

    // Require welcomeEmbed json object and load it.
    let welcomeEmbed = require('../assets/json/welcomeEmbed.json');
    
    try {
      let channel = guild.systemChannel || guild.channels.cache.get(ch => ch.id === guild.systemChannelID);
      channel.send({ embeds: [welcomeEmbed] });
    } catch (err) {
      logger.warn(`Unable to send bot welcome message in server ${guild.name}!`);
      logger.error(err.message); logger.debug(err.stack);
    }
    let 
      announcerSettings = guild.settings.get('announcer', undefined),
      autoModSettings = guild.settings.get('automod', undefined),
      chatBotSettings = guild.settings.get('chatbot', undefined),
      botLogSettings = guild.settings.get('botlogger', undefined),
      modLogSettings = guild.settings.get('modlogger', undefined);
    // Check if these settings are defined using falsy checks.
    if (!announcerSettings||!autoModSettings||!chatBotSettings||!botLogSettings||!modLogSettings) {
      logger.warn(`Guild ${guild.name} missing settings, possibly a new guild.`);
      logger.warn(`Generating settings now... please wait.`)
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
      logger.debug(`Finished generated settings for ${guild.name} (${guild.id}).`);
      logger.info(`Settings generated successfully for ${guild.name}.`);
    } else {
      // Do not override the current configuration if settings are defined.
      logger.warn(`${guild.name} has already been configured! Skipped settings check.`);
      logger.debug(`${guild.name} (${guild.id}) already has a configuration!`);
      logger.debug('No new guild configurations were generated.');
    };
  }
}