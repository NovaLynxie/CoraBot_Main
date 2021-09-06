const logger = require('../plugins/winstonLogger.js');
const Keyv = require('@keyvhq/core');
const KeyvSQLite = require('@keyvhq/sqlite');
const clientStore = new Keyv({ store: new KeyvSQLite({uri: 'sqlite://data/settings.db'}), namespace: 'clientSettings' });
const guildStore = new Keyv({ store: new KeyvSQLite({uri: 'sqlite://data/settings.db'}), namespace: 'guildSettings' });
logger.verbose(`clientStore: ${JSON.stringify(clientStore,null,2)}`);
logger.verbose(`guildStore: ${JSON.stringify(guildStore,null,2)}`);
const clientSettings = require('../assets/json/clientSettings.json');
const guildSettings = require('../assets/json/guildSettings.json');

// Generate settings if none is found.
async function generateGuildSettings (guildIDs) {
  logger.debug('Preparing to check guild settings now...');
  guildIDs.forEach(async (guildID) => {
    logger.debug(`Checking ${guildID} of guildIDs`);
    let settings = await guildStore.get(guildID);
    if (settings) {
      logger.debug(`Guild ${guildID} already has settings defined!`);
      return; // don't do anything if <guildId> already has settings.
    } else {
      logger.debug(`Adding new settings for ${guildID} now...`); 
      await guildStore.set(guildID, guildSettings);
    };    
  });
  logger.debug('Finished checking guild settings.');
  logger.info('Guild settings are now available.');
};
async function generateClientSettings () {
  logger.debug('Preparing to generate bot settings now...');
  let settings = await clientStore.get('botSettings');
  if (settings) {
    logger.debug('Bot settings are already set! Skipping.');
  } else {
    logger.debug('Bot settings not yet set! Adding new settings now.');
  }
  await clientStore.set("clientSettings", clientSettings);
  logger.debug('Finished checking bot settings.');
  logger.info('Bot settings are now available.');
};

// Read/Write functions for KeyV database - Client Settings.
async function saveClientSettings (data, client) {
  logger.debug(`Writing new settings for ${client.user.tag} to database.`);
  await guildStore.set("clientSettings", data.settings);
  logger.debug(`Finished updating bot settings for ${client.user.tag}.`);
};
async function readClientSettings (client) {
  logger.debug(`Fetching settings for ${client.user.tag} (ID:${client.user.id}).`);
  let res = await clientStore.get("clientSettings");
  return res;
};
async function clearClientSettings (client) {
  logger.debug(`Removing all settings for ${client.user.tag} (ID:${client.user.id}).`);
  await clientStore.clear();
}

// Read/Write functions for KeyV database - Guild Settings.
async function saveGuildSettings (settings, guild) {
  logger.debug('Writing new guild settings to database.');
  await guildStore.set(guild.id, settings);
  logger.debug('Finished updating guild settings.');
};
async function readGuildSettings (guild) {
  logger.debug(`Fetching settings for ${guild.name} (ID:${guild.id}).`);
  let res = await guildStore.get(guild.id);
  return res;
};
async function deleteGuildSettings (guild) {
  logger.debug(`Removing all settings for ${guild.name} (ID:${guild.id}).`);
  await guildStore.delete(guild.id);
}
async function clearGuildSettings (guild) {
  logger.debug(`Removing all guild settings.`);
  await guildStore.clear();
}

// Finally export functions for use in other modules.
module.exports = {
  clearClientSettings, clearGuildSettings,
  generateClientSettings, generateGuildSettings,
  saveClientSettings, saveGuildSettings,
  readClientSettings, readGuildSettings, deleteGuildSettings
};