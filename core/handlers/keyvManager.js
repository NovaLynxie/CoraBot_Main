const logger = require('../plugins/winstonLogger.js');
const Keyv = require('@keyvhq/core');
const KeyvSQLite = require('@keyvhq/sqlite');

// Configure settings storage paths.
const clientPrefStore = new Keyv({ store: new KeyvSQLite({uri: 'sqlite://data/settings.db'}), namespace: 'clientSettings' });
const guildPrefStore = new Keyv({ store: new KeyvSQLite({uri: 'sqlite://data/settings.db'}), namespace: 'guildSettings' });
// Configure data storage paths.
const guildDataStore = new Keyv({ store: new KeyvSQLite({ uri: 'sqlite://data/guilds.db' }) });

// Debug outputs for database managers. (VERBOSE ONLY)
logger.verbose(`clientPrefStore: ${JSON.stringify(clientPrefStore,null,2)}`);
logger.verbose(`guildPrefStore: ${JSON.stringify(guildPrefStore,null,2)}`);
logger.verbose(`guildDataStore: ${JSON.stringify(guildDataStore,null,2)}`);

// Require settings templates for use.
const clientSettingsTemplate = require('../assets/templates/database/clientSettings.json');
const guildSettingsTemplate = require('../assets/templates/database/guildSettings.json');
const guildDataTemplate = require('../assets/templates/database/guildData.json');

// Generate settings if none is found.
async function generateGuildSettings (guildIDs) {
  logger.debug('Preparing to check guild settings now...');
  guildIDs.forEach(async (guildID) => {
    logger.debug(`Checking ${guildID} of guildIDs`);
    let settings = await guildPrefStore.get(guildID);
    if (settings) {
      logger.debug(`Guild ${guildID} already has settings defined!`);
      return; // don't do anything if <guildId> already has settings.
    } else {
      logger.debug(`Adding new settings for ${guildID} now...`); 
      await guildPrefStore.set(guildID, guildSettingsTemplate);
    };    
  });
  logger.debug('Finished checking guild settings.');
  logger.info('Guild settings are now available.');
};
async function generateClientSettings () {
  logger.debug('Preparing to generate bot settings now...');
  let settings = await clientPrefStore.get('botSettings');
  if (settings) {
    logger.debug('Bot settings are already set! Skipping.');
  } else {
    logger.debug('Bot settings not yet set! Adding new settings now.');
  }
  await clientPrefStore.set("clientSettings", clientSettingsTemplate);
  logger.debug('Finished checking bot settings.');
  logger.info('Bot settings are now available.');
};

// Read/Write functions for KeyV database - Client Settings.
async function saveClientSettings (data, client) {
  logger.debug(`Writing new settings for ${client.user.tag} to database.`);
  await guildPrefStore.set("clientSettings", data.settings);
  logger.debug(`Finished updating bot settings for ${client.user.tag}.`);
};
async function readClientSettings (client) {
  logger.debug(`Fetching settings for ${client.user.tag} (ID:${client.user.id}).`);
  let res = await clientPrefStore.get("clientSettings");
  return res;
};
async function clearClientSettings (client) {
  logger.debug(`Removing all settings for ${client.user.tag} (ID:${client.user.id}).`);
  await clientPrefStore.clear();
}

// Read/Write functions for KeyV database - Guild Settings.
async function saveGuildSettings (settings, guild) {
  logger.debug('Writing new guild settings to database.');
  await guildPrefStore.set(guild.id, settings);
  logger.debug('Finished updating guild settings.');
};
async function readGuildSettings (guild) {
  logger.debug(`Fetching settings for ${guild.name} (ID:${guild.id}).`);
  let res = await guildPrefStore.get(guild.id);
  return res;
};
async function deleteGuildSettings (guild) {
  logger.debug(`Removing all settings for ${guild.name} (ID:${guild.id}).`);
  await guildPrefStore.delete(guild.id);
}
async function clearGuildSettings (guild) {
  logger.debug('Removing all guild settings.');
  await guildPrefStore.clear();
}

// Guild Data Handlers
async function generateGuildData (guildIDs) {
  logger.debug('Preparing to check guild data now...');
  guildIDs.forEach(async (guildID) => {
    logger.debug(`Checking ${guildID} of guildIDs`);
    let data = await guildDataStore.get(guildID);
    if (data) {
      logger.debug(`Guild ${guildID} data entries already added!`);
      return; // don't do anything if <guildId> already has settings.
    } else {
      logger.debug(`Adding new data entries for ${guildID} now...`); 
      await guildDataStore.set(guildID, guildDataTemplate);
    };    
  });
  logger.debug('Finished checking guild settings.');
  logger.info('Guild data is now available.');
};
async function readGuildData (guild) {
  logger.debug(`Fetching guild data for ${guild.name} (ID:${guild.id}).`);
  let res = await guildDataStore.get(guild.id);
  return res;
};
async function saveGuildData (data, guild) {
  logger.debug(`Updating guild data for ${guild.name} (ID:${guild.id}).`);
  await guildDataStore.set(guild.id, data);
  logger.debug(`Updated guild data for ${guild.name} (ID:${guild.id}).`);
};
async function deleteGuildData (guild) {
  logger.debug(`Removing guild data for ${guild.name} (ID:${guild.id}).`);
  await guildDataStore.delete(guild.id);
};
async function resetGuildData () {
  logger.debug('Removing all guild data.');
  await guildDataStore.clear();
};

// Finally export handler functions for use in other modules.
module.exports.settingsHandlers = {
  clearClientSettings, clearGuildSettings,
  generateClientSettings, generateGuildSettings,
  saveClientSettings, saveGuildSettings,
  readClientSettings, readGuildSettings, deleteGuildSettings
};
module.exports.dataHandlers = {
  readGuildData, saveGuildData, deleteGuildData, generateGuildData, resetGuildData
};