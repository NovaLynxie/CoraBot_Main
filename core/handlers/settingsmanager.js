const logger = require('../plugins/winstonlogger.js');
const Keyv = require('keyv');
const clientStore = new Keyv({ store: new Keyv('sqlite://data/storage/settings.db'), namespace: 'clientSettings' });
const guildStore = new Keyv({ store: new Keyv('sqlite://data/storage/settings.db'), namespace: 'guildSettings' });
const clientSettings = require('../assets/json/clientSettings.json');
const guildSettings = require('../assets/json/guildSettings.json');

// Generate settings if none is found.
async function generateGuildSettings (guilds) {
  logger.warn('Preparing to generate guild settings now...');
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
};
async function generateClientSettings () {
  logger.warn('Preparing to generate bot settings now...');
  await clientStore.set("clientSettings", clientSettings);
};

// Read/Write functions for KeyV database - Client Settings.
async function saveClientSettings (data, client) {
  await guildStore.set("clientSettings", data.settings);
};
async function readClientSettings (client) {
  logger.debug(`Fetching settings for ${client.user.tag} (ID:${client.user.id}).`);
  let res = await clientStore.get("clientSettings");
  return res;
};

// Read/Write functions for KeyV database - Guild Settings.
async function saveGuildSettings (data, guild) {
  await guildStore.set(guild.id, data.settings);
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