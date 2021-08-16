const Keyv = require('keyv');
const clientStore = new Keyv({ store: new Keyv('sqlite://data/storage/settings.db'), namespace: 'clientSettings' });
const guildStore = new Keyv({ store: new Keyv('sqlite://data/storage/settings.db'), namespace: 'guildSettings' });
const clientSettings = require('../assets/json/clientSettings.json');
const guildSettings = require('../assets/json/guildSettings.json');

async function storeHandler(data, client) {
  function verifyGuildObject(object) {
    if (!object.guild || typeof object.guild !== 'object') {
      console.error("Undefined or incorrect data type for 'guild'!");
    };  
  };
  function verifySettingsObject(object) {
    if (!object.settings || typeof object.settings !== 'object') {
      console.error("Undefined or incorrect data type for 'settings'!");
    };
  }
  let settingsObject;
  console.warn('Updating database... this may take a while.');
  if (data.mode === 'r') {
    verifyGuildObject(data);
    settingsObject = await guildStore.get(data.guild.id);
    return res = settingsObject;
  } else
  if (data.mode === 'w') {
    verifyGuildObject(data);
    await guildStore.set(data.guild.id, data.settings);
  } else
  if (data.mode === 'g') {
    let guilds = data.guilds;
    guilds.forEach(async (guildId) => {
      console.debug(`Parsing ${guildId} of guilds`);
      let settings = guildSettings;
      await guildStore.set(guildId, settings);
    });
  };
};
module.exports = {storeHandler};