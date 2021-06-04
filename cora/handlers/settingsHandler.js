// Settings Handler for Commando database custom settings
/*
  This is very experimental! 
  Requires rewrites of other modules to use this instead of bootLoader settings!
  Continue to use config.toml file till new settings loader is implemented.
*/
// Common function for other modules to fetch settings from.
// Allows for multi-server configurations using settings provider.
module.exports = (client, setting) => {
  let settingsObject;
  logger.debug(`Fetching settings data for ${setting}`)
  settingsObject[setting]=client.settings.get(setting, undefined);
  logger.debug(`Grabbed data for ${setting}`);
  return settingsObject;
};