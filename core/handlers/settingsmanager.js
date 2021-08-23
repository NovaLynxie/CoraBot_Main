const logger = require('../plugins/winstonlogger.js');
const Keyv = require('keyv');
const clientStore = new Keyv({ store: new Keyv('sqlite://data/storage/settings.db'), namespace: 'clientSettings' });
const guildStore = new Keyv({ store: new Keyv('sqlite://data/storage/settings.db'), namespace: 'guildSettings' });
const clientSettings = require('../assets/json/clientSettings.json');
const guildSettings = require('../assets/json/guildSettings.json');

// Generate settings if none is found.
async function generateGuildSettings (guilds) {
  logger.debug('Preparing to check guild settings now...');
  guilds.forEach(async (guildId) => {
    logger.debug(`Checking ${guildId} of guilds`);
    let settings = await guildStore.get(guildId);
    if (settings) {
      logger.debug(`Guild ${guildId} already has settings defined!`);
      return; // don't do anything if <guildId> already has settings.
    } else {
      logger.debug(`Adding new settings for ${guildId} now...`); 
      await guildStore.set(guildId, guildSettings);
    };    
  });
  logger.debug('Finished checking guild settings.');
  logger.info('Guild settings are now available.');
};
async function generateClientSettings () {
  logger.debug('Preparing to generate bot settings now...');
  let settings = await clientStore.get('clientSettings');
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

// Read/Write functions for KeyV database - Guild Settings.
async function saveGuildSettings (data, guild) {
  logger.debug('Writing new guild settings to database.');
  await guildStore.set(guild.id, data.settings);
  logger.debug('Finished updating guild settings.');
};
async function readGuildSettings (guild) {
  logger.debug(`Fetching settings for ${guild.name} (ID:${guild.id}).`);
  let res = await guildStore.get(guild.id);
  return res;
};

// Finally export functions for use in other modules.
module.exports = {
  generateClientSettings, generateGuildSettings,
  saveClientSettings, saveGuildSettings,
  readClientSettings, readGuildSettings
};