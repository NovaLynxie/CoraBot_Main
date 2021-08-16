const Keyv = require('keyv');
const clientStore = new Keyv({ store: new Keyv('sqlite://data/storage/settings.db'), namespace: 'clientSettings' });
const guildStore = new Keyv({ store: new Keyv('sqlite://data/storage/settings.db'), namespace: 'guildSettings' });
const clientSettings = require('../assets/json/clientSettings.json');
const guildSettings = require('../assets/json/guildSettings.json');

async function storeHandler(data, client) {
  function verifyGuildObject(object) {
    if (!object.guild || typeof object.guild !== 'object') {
      console.error("Undefined or incorrect data type for 'guild'!");
    }
    if (!object.settings || typeof object.settings !== 'object') {
      console.error("Undefined or incorrect data type for 'settings'!");
    }
  };
  let settingsObject;
  if (data.mode.match(/r[ead]+/gi)) {
    verifyGuildObject(data);
    settingsObject = await guildStore.get(data.guild.id);
    return settingsObject;
  } else
  if (data.mode.match(/w[rite]+/gi)) {
    verifyGuildObject(data);
    await guildStore.set(data.guild.id, data.settings);
  } else
  if (data.mode.match(/g[enerate]+/gi)) {
    let guilds = client.guilds.cache.map(g => g.id);
    guilds.forEach(async (guild) => {
      let settings = guildSettings;
      await guildStore.set(data.guild.id, settings);
    });
  };
};
module.exports = {storeHandler};