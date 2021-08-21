const logger = require('../plugins/winstonlogger.js');
const Keyv = require('keyv');
const clientStore = new Keyv({ store: new Keyv('sqlite://data/storage/settings.db'), namespace: 'clientSettings' });
const guildStore = new Keyv({ store: new Keyv('sqlite://data/storage/settings.db'), namespace: 'guildSettings' });
const clientSettings = require('../assets/json/clientSettings.json');
const guildSettings = require('../assets/json/guildSettings.json');

async function storeHandler(data, client) {
  function verifyGuildObject(object) {
    if (!object.guild || typeof object.guild !== 'object') {
      logger.error("Undefined or incorrect data type for 'guild'!");
    };  
  };
  function verifySettingsObject(object) {
    if (!object.settings || typeof object.settings !== 'object') {
      logger.error("Undefined or incorrect data type for 'settings'!");
    };
  };
  let settingsObject;
  if (data.mode === 'r') {
    verifyGuildObject(data);
    settingsObject = await guildStore.get(data.guild.id);
    return res = settingsObject;
  } else
  if (data.mode === 'w') {
    logger.warn('Updating database... this may take a while.');
    verifyGuildObject(data);
    await guildStore.set(data.guild.id, data.settings);
    logger.info('Finished updating database.');
  } else
  if (data.mode === 'g') {
    logger.warn('Updating database... this may take a while.');
    let guilds = data.guilds;
    guilds.forEach(async (guildId) => {
      logger.debug(`Parsing ${guildId} of guilds`);
      let settings = guildSettings;
      await guildStore.set(guildId, settings);
    });
    logger.info('Finished updating database.');
  };
  
};
module.exports = {storeHandler};