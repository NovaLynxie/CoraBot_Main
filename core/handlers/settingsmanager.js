const logger = require('../plugins/winstonlogger.js');
const Keyv = require('keyv');
const clientStore = new Keyv({ store: new Keyv('sqlite://data/storage/settings.db'), namespace: 'clientSettings' });
const guildStore = new Keyv({ store: new Keyv('sqlite://data/storage/settings.db'), namespace: 'guildSettings' });
const clientSettings = require('../assets/json/clientSettings.json');
const guildSettings = require('../assets/json/guildSettings.json');

// Verification of incoming data object. (WIP)
function verifyDataObj (data) {
  if (data !== typeof 'object') return logger.error('Invalid data type! Expected object!');
};

async function generateGuildSettings (data, guild) {
  guilds.forEach(async (guildId) => {
    logger.debug(`Parsing ${guildId} of guilds`);
    await guildStore.set(guildId, guildSettings);
  });
};
async function generateClientSettings (data, client) {
  await clientStore.set("clientSettings", clientSettings);
};

// Read/Write functions for KeyV database - Client Settings.
async function saveClientSettings (data, client) {
  //
};
async function readClientSettings (client) {
  logger.debug(`Fetching settings for ${client.user.tag} (ID:${client.user.id}).`);
  let res = await clientStore.get("clientSettings");
  return res;
};

// Read/Write functions for KeyV database - Guild Settings.
async function saveGuildSettings (data, guild) {
  //
  
};
async function readGuildSettings (guild) {
  logger.debug(`Fetching settings for ${guild.name} (ID:${guild.id}).`);
  let res = await guildStore.get(guild.id);
  return res;
};

// Finally export functions for use in other modules.
module.exports = {
  generateClientSettings, generateGuildSettings
  saveClientSettings, saveGuildSettings,
  readClientSettings, readGuildSettings
};