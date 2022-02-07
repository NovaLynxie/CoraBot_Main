const logger = require('../utils/winstonLogger');
const KeyvCore = require('@keyvhq/core');
const KeyvSQLite = require('@keyvhq/sqlite');
const clientPrefStore = new KeyvCore({ store: new KeyvSQLite({ uri: 'sqlite://data/settings.db' }), namespace: 'client' });
const guildPrefStore = new KeyvCore({ store: new KeyvSQLite({ uri: 'sqlite://data/guilds/settings.db' }), namespace: 'guild' });
const guildDataStore = {
  offenses: new KeyvCore({ store: new KeyvSQLite({ uri: 'sqlite://data/guilds/main.db', table: 'moderation' }) }),
  trackers: new KeyvCore({ store: new KeyvSQLite({ uri: 'sqlite://data/guilds/main.db', table: 'trackers' }) }),
  voice: new KeyvCore({ store: new KeyvSQLite({ uri: 'sqlite://data/guilds/voice.db' }), namespace: 'guild' })
};
const guildDataTypes = ['offenses', 'trackers', 'voice'];
const ErrCallback = (error, db) => {
  logger.fatal(`Error initializing ${db.name} database!`);
  logger.fatal(error.message); logger.debug(error.stack);
};
clientPrefStore.on('error', (error) => ErrCallback(error, { name: 'settings', type: 'client' }));
guildPrefStore.on('error', (error) => ErrCallback(error, { name: 'settings', type: 'guildPrefs' }));
guildDataTypes.forEach(dataType => {
  guildDataStore[dataType].on('error', (error) => ErrCallback(error, { name: dataType, type: 'guildData' }));
});
const clientSettingsTemplate = require('../assets/templates/database/clientSettings.json');
const guildSettingsTemplate = require('../assets/templates/database/guildSettings.json');
const guildDataTemplate = require('../assets/templates/database/guildData.json');
async function generateGuildSettings(guilds) {
  logger.verbose('Preparing to check guild settings now...');
  const guildIDs = guilds.cache.map(guild => guild.id);
  guildIDs.forEach(async (guildID) => {
    logger.verbose(`Checking ${guildID} of guildIDs`);
    const settings = await guildPrefStore.get(guildID);
    if (settings) {
      logger.verbose(`Guild ${guildID} already has settings defined!`);
      logger.verbose(`Checking settings for ${guildID} for any updates.`);
      const guildSettingKeys = Object.keys(guildSettingsTemplate);
      guildSettingKeys.forEach(key => {
        if (settings[key] === undefined) {
          logger.verbose(`Setting property '${key}' not found! Adding setting property.`)
          settings[key] = guildSettingsTemplate[key];
        } else {
          logger.verbose(`Setting name '${key}' already exists!`);
        };
      });
      await guildPrefStore.set(guildID, settings);
      return;
    } else {
      logger.verbose(`Adding new settings for ${guildID} now...`);
      await guildPrefStore.set(guildID, guildSettingsTemplate);
    };
  });
  logger.verbose('Finished checking guild settings.');
  logger.info('Guild settings are now available.');
};
async function generateClientSettings() {
  logger.verbose('Preparing to generate bot settings now...');
  const settings = await clientPrefStore.get('botSettings');
  if (settings) {
    logger.verbose('Bot settings are already set! Skipping.');
  } else {
    logger.verbose('Bot settings not yet set! Adding new settings now.');
  };
  await clientPrefStore.set('clientSettings', clientSettingsTemplate);
  logger.verbose('Finished checking bot settings.');
  logger.info('Bot settings are now available.');
};
async function saveClientSettings(settings, client) {
  logger.verbose(JSON.stringify(settings));
  logger.verbose(`Writing new settings for ${client.user.tag} to database.`);
  await clientPrefStore.set('clientSettings', settings);
  logger.verbose(`Finished updating bot settings for ${client.user.tag}.`);
};
async function readClientSettings(client) {
  logger.verbose(`Fetching settings for ${client.user.tag} (ID:${client.user.id}).`);
  const res = await clientPrefStore.get('clientSettings');
  logger.verbose(JSON.stringify(res));
  return res;
};
async function clearClientSettings(client) {
  logger.verbose(`Removing all settings for ${client.user.tag} (ID:${client.user.id}).`);
  await clientPrefStore.clear();
};
async function saveGuildSettings(settings, guild) {
  logger.verbose(JSON.stringify(settings));
  logger.verbose('Writing new guild settings to database.');
  await guildPrefStore.set(guild.id, settings);
  logger.verbose('Finished updating guild settings.');
};
async function readGuildSettings(guild) {
  logger.verbose(`Fetching settings for ${guild.name} (ID:${guild.id}).`);
  const res = await guildPrefStore.get(guild.id);
  logger.verbose(JSON.stringify(res));
  return res;
};
async function deleteGuildSettings(guild) {
  logger.verbose(`Removing all settings for ${guild.name} (ID:${guild.id}).`);
  await guildPrefStore.delete(guild.id);
};
async function clearGuildSettings() {
  logger.verbose('Removing all guild settings.');
  await guildPrefStore.clear();
};
async function generateGuildData(guilds) {
  logger.debug('Preparing to check guild data now...');
  const guildIDs = guilds.cache.map(guild => guild.id);
  guildIDs.forEach(async (guildID) => {
    logger.verbose(`Checking ${guildID} of guildIDs`);
    const data = {
      offenses: await guildDataStore.offenses.get(guildID),
      trackers: await guildDataStore.trackers.get(guildID),
      voice: await guildDataStore.voice.get(guildID)
    };
    let guildData;
    if (data.offenses) {
      logger.verbose(`Guild ${guildID} data entries already added!`);
      logger.verbose(`Checking datastore for ${guildID} for any updates.`);
      guildData = Object.keys(guildDataTemplate.offenses);
      guildData.forEach(key => {
        if (data[key] === undefined) {
          logger.verbose(`Data property '${key}' not found! Adding new data property.`)
          data.offenses[key] = guildDataTemplate.offenses[key];
        } else {
          logger.verbose(`Data key '${key}' already exists!`);
        };
      });
      await guildDataStore.offenses.set(guildID, data.offenses);
    } else {
      logger.verbose(`Guild 'offenses' data does not exist for ${guildID}!`);
      logger.verbose(`Generating 'offenses' data for ${guildID}...`);
      data.offenses = guildDataTemplate.offenses;
      await guildDataStore.offenses.set(guildID, data.offenses);
    };
    if (data.trackers) {
      logger.verbose(`Guild ${guildID} data entries already added!`);
      logger.verbose(`Checking datastore for ${guildID} for any updates.`);
      guildDataProps = Object.keys(guildDataTemplate.trackers);
      guildDataProps.forEach(key => {
        if (data.trackers[key] === undefined) {
          logger.verbose(`Data property '${key}' not found! Adding new data property.`)
          data.trackers[key] = guildDataTemplate.trackers[key];
        } else {
          logger.verbose(`Data key '${key}' already exists!`);
        };
      });
      await guildDataStore.trackers.set(guildID, data.trackers);
    } else {
      logger.verbose(`Guild 'trackers' data does not exist for ${guildID}!`);
      logger.verbose(`Generating 'trackers' data for ${guildID}...`);
      data.trackers = guildDataTemplate.trackers;
      await guildDataStore.trackers.set(guildID, data.trackers);
    };
    if (data.voice) {
      logger.verbose(`Guild ${guildID} data entries already added!`);
      logger.verbose(`Checking datastore for ${guildID} for any updates.`);
      guildDataProps = Object.keys(guildDataTemplate.voice);
      guildDataProps.forEach(key => {
        if (data.voice[key] === undefined) {
          logger.verbose(`Data property '${key}' not found! Adding new data property.`)
          data.voice[key] = guildDataTemplate.voice[key];
        } else {
          logger.verbose(`Data key '${key}' already exists!`);
        };
      });
      await guildDataStore.voice.set(guildID, data.voice);
    } else {
      logger.verbose(`Guild 'voice' data does not exist for ${guildID}!`);
      logger.verbose(`Generating 'voice' data for ${guildID}...`);
      data.voice = guildDataTemplate.voice;
      await guildDataStore.voice.set(guildID, data.voice);
    };
  });
  logger.debug('Finished checking guild settings.');
  logger.info('Guild data is now available.');
};
async function readGuildModData(guild) {
  logger.verbose(`Fetching guild moderation data for ${guild.name} (ID:${guild.id}).`);
  const res = await guildDataStore.offenses.get(guild.id);
  return res;
};
async function saveGuildModData(guild, data) {
  logger.verbose(`Updating guild moderation data for ${guild.name} (ID:${guild.id}).`);
  await guildDataStore.offenses.set(guild.id, data);
  logger.verbose(`Updated guild moderation data for ${guild.name} (ID:${guild.id}).`);
};
async function deleteGuildModData(guild) {
  logger.verbose(`Removing guild moderation data for ${guild.name} (ID:${guild.id}).`);
  await guildDataStore.offenses.delete(guild.id);
};
async function readGuildVoiceData(guild) {
  logger.verbose(`Fetching guild voice data for ${guild.name} (ID:${guild.id}).`);
  const res = await guildDataStore.voice.get(guild.id);
  return res;
};
async function saveGuildVoiceData(guild, data) {
  logger.verbose(`Updating guild voice data for ${guild.name} (ID:${guild.id}).`);
  await guildDataStore.voice.set(guild.id, data);
  logger.verbose(`Updated guild voice data for ${guild.name} (ID:${guild.id}).`);
};
async function deleteGuildVoiceData(guild) {
  logger.verbose(`Removing guild voice data for ${guild.name} (ID:${guild.id}).`);
  await guildDataStore.voice.delete(guild.id);
};
async function readGuildTrackerData(guild) {
  logger.verbose(`Fetching guild trackers data for ${guild.name} (ID:${guild.id}).`);
  const res = await guildDataStore.trackers.get(guild.id);
  return res;
};
async function saveGuildTrackerData(guild, data) {
  logger.verbose(`Updating guild trackers data for ${guild.name} (ID:${guild.id}).`);
  await guildDataStore.trackers.set(guild.id, data);
  logger.verbose(`Updated guild trackers data for ${guild.name} (ID:${guild.id}).`);
};
async function deleteGuildTrackerData(guild) {
  logger.verbose(`Removing guild trackers data for ${guild.name} (ID:${guild.id}).`);
  await guildDataStore.trackers.delete(guild.id);
};

// EXPERIMENTAL DATA HANDLERS! 
async function multiStoreHandler(guild, data, endpoint, method) {
  if (!guildDataStore[endpoint][method]) {
    for (const subroute of Object.keys(guildDataStore[endpoint])) {
      switch (method) {
        case 'set':
          await guildDataStore[endpoint][subroute][method](guild.id, data);
          break;
        case 'get':
        case 'delete':
          guildDataStore[endpoint][subroute][method](guild.id);
          break;
        case 'clear':
          for (endpoint of guildDataStore) {
            guildDataStore[endpoint][subroute][method]();
          };
          break;
        default:
          logger.debug('Unknown database method function!');
      };
    };
  } else {
    switch (method) {
      case 'set':
        await guildDataStore[endpoint][method](guild.id, data);
        break;
      case 'get':
      case 'delete':
        await guildDataStore[endpoint][method](guild.id);
        break;
      case 'clear':
        await guildDataStore[endpoint][method]();
        break;
      default:
        logger.debug('Unknown database method function!');
    };
  };
};
async function deleteGuildData(guild, endpoint) {
  logger.verbose(`Removing guild data for ${guild.name} (guild:${guild.id}).`);
  await multiStoreHandler(guild, data, endpoint, 'delete');
};
async function readGuildData(guild, endpoint) {
  logger.verbose(`Reading guild data for ${guild.name} (guild:${guild.id}).`);
  return await multiStoreHandler(guild, data, endpoint, 'get');
};
async function saveGuildData(guild, endpoint, data) {
  logger.verbose(`Saving guild data for ${guild.name} (guild:${guild.id}).`);
  await multiStoreHandler(guild, data, endpoint, 'set');
};
async function resetGuildData(guilds) {
  logger.verbose('Removing all guild data.');
  for (const endpoint of Object.keys(guildDataStore)) {
    await multiStoreHandler(null, null, endpoint, 'clear');
  };
  await generateGuildData(guilds);
};
// EXPERIMENTAL DATA HANDLERS! 

module.exports.storage = {
  data: {
    init: generateGuildData, reset: resetGuildData,
    delete: deleteGuildData, get: readGuildData, set: saveGuildData,
    moderation: {
      delete: deleteGuildModData,
      get: readGuildModData,
      set: saveGuildModData
    },
    voice: {
      delete: deleteGuildVoiceData,
      get: readGuildVoiceData,
      set: saveGuildVoiceData
    },
    trackers: {
      delete: deleteGuildTrackerData,
      get: readGuildTrackerData,
      set: saveGuildTrackerData
    }
  },
  settings: {
    clear: clearClientSettings,
    init: generateClientSettings,
    get: readClientSettings,
    set: saveClientSettings,
    guild: {
      clear: clearGuildSettings,
      init: generateGuildSettings,
      delete: deleteGuildSettings,
      set: saveGuildSettings,
      get: readGuildSettings
    }
  }
};