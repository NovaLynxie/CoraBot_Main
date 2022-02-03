const logger = require('../utils/winstonLogger');
const KeyvCore = require('@keyvhq/core');
const KeyvSQLite = require('@keyvhq/sqlite');
const clientPrefStore = new KeyvCore({ store: new KeyvSQLite({ uri: 'sqlite://data/settings.db' }), namespace: 'client' });
const guildPrefStore = new KeyvCore({ store: new KeyvSQLite({ uri: 'sqlite://data/guilds/settings.db' }), namespace: 'guild' });
const guildDataStore = {
  economy: {
    shop: new KeyvCore({ store: new KeyvSQLite({ uri: 'sqlite://data/guilds/economy.db', table: 'shop' }) }),
    users: new KeyvCore({ store: new KeyvSQLite({ uri: 'sqlite://data/guilds/economy.db', table: 'users' }) })
  },
  offenses: new KeyvCore({ store: new KeyvSQLite({ uri: 'sqlite://data/guilds/main.db', table: 'moderation' }) }),
  trackers: new KeyvCore({ store: new KeyvSQLite({ uri: 'sqlite://data/guilds/main.db', table: 'trackers' }) }),
  voice: new KeyvCore({ store: new KeyvSQLite({ uri: 'sqlite://data/guilds/voice.db' }), namespace: 'guild' })
};
const guildDataTypes = [{ prop: 'economy', nest: ['shop', 'users'] }, 'offenses', 'trackers', 'voice'];
const ErrCallback = (error, db) => {
  logger.fatal(`Error initializing ${db.name} database!`);
  logger.fatal(error.message); logger.debug(error.stack);
};
clientPrefStore.on('error', (error) => ErrCallback(error, { name: 'settings', type: 'client' }));
guildPrefStore.on('error', (error) => ErrCallback(error, { name: 'settings', type: 'guildPrefs' }));
guildDataTypes.forEach(dataType => {
  if (typeof dataType === 'object') {
    let { prop, nest } = dataType;
    nest.forEach(key => {
      guildDataStore[prop][key].on('error', (error) => ErrCallback(error, { name: `${prop}.${key}`, type: 'guildData' }))
    });
  } else {
    guildDataStore[dataType].on('error', (error) => ErrCallback(error, { name: dataType, type: 'guildData' }));
  };
});
const clientSettingsTemplate = require('../assets/templates/database/clientSettings.json');
const guildSettingsTemplate = require('../assets/templates/database/guildSettings.json');
const guildDataTemplate = require('../assets/templates/database/guildData.json');
async function generateGuildSettings(guilds) {
  const guildIDs = guilds.cache.map(guild => guild.id);
  logger.verbose('Preparing to check guild settings now...');
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
async function updateGuildDataProps(data, property) {
  if (data[property]) {
    logger.verbose(`Guild ${guildID} data entries already added!`);
    logger.verbose(`Checking datastore for ${guildID} for any updates.`);
    Object.keys(guildDataTemplate[property]).forEach(key => {
      if (data[prop][key] === undefined) {
        logger.verbose(`Data property '${key}' not found! Adding new data property.`)
        data[prop][key] = guildDataTemplate[prop][key];
      } else { logger.verbose(`Data key '${key}' already exists!`) };
    });
  } else {
    logger.verbose(`Guild 'trackers' data does not exist for ${guildID}!`);
    logger.verbose(`Generating 'trackers' data for ${guildID}...`);
    obj[prop] = guildDataTemplate[prop];
  };
  return data;
};
async function generateGuildData(guilds) {
  logger.debug('Preparing to check guilds data now...');
  const guildIDs = guilds.cache.map(guild => guild.id);
  for (const guildID of guildIDs) {
    logger.verbose(`Checking ${guildID} of guildIDs`);
    const storage = {
      economy: {
        shop: await guildDataStore.economy.shop.get(guildID),
        users: await guildDataStore.economy.users.get(guildID)
      },
      offenses: await guildDataStore.offenses.get(guildID),
      trackers: await guildDataStore.trackers.get(guildID),
      voice: await guildDataStore.voice.get(guildID)
    };
    let guildData; let guildDataKeys = Object.keys(storage);
    for (const endpoint of Object.keys(storage)) {
      if (storage[endpoint]) {
        logger.verbose(`Guild ${guildID} data entries already added!`);
        logger.verbose(`Checking datastore for ${guildID} for any updates.`);
        for (const property of Object.keys(guildDataTemplate[endpoint])) {
          if (storage[endpoint][property] === undefined) {
            logger.verbose(`Data property '${property}' not found! Adding new data property.`)
            storage[endpoint][property] = guildDataTemplate[endpoint][property];
          } else { logger.verbose(`Data property '${property}' already exists!`) };
        };
      } else {
        logger.verbose(`Guild '${endpoint}' data does not exist for ${guildID}!`);
        logger.verbose(`Generating '${endpoint}' data for ${guildID}...`);
        storage[endpoint] = guildDataTemplate[endpoint];
      };
      if (!guildDataStore[endpoint] ?.set) {
        logger.debug(`Detected multiple sub-routes in endpoint ${endpoint}!`);
        for (const property of Object.keys(storage[endpoint])) {
          logger.verbose(`Verifying sub-route '${property}'.`);
          if (!guildDataStore[endpoint][property]) continue;
          logger.verbose(`Parsing data to sub-route '${property}'.`);
          guildDataStore[endpoint][property].set(guildID, storage[endpoint][property]);
        };
      } else {
        guildDataStore[endpoint] ?.set(guildID, storage[endpoint]);
      };
    };
  };
  logger.debug('Finished checking guild settings.');
  logger.info('Guild data is now available.');
};
async function syncEconomyUserData(users) {
  logger.verbose(`Syncing economy data for ${users.size} users.`);
  const userIDs = users.cache.map(user => user.id);
  for (const userID of userIDs) {
    let econUser = await guildDataStore.economy.users.get(userID);
    if (!econUser) {
      logger.debug(`Creating user economy data for UserID:${userID}`); 
      econUser = { balance: 0, items: [] };
    } else {
      logger.debug(`UserID:${userID} already exists!`);
    };
    logger.verbose('Saving economy user data...');
    await guildDataStore.economy.users.get(userID, econUser);
    logger.verbose(`Saved User:${userID} successfully!`);
  };
  logger.verbose(`Finished syncing economy user data!`);
};
async function readEconomyUserData(guild, route) {
  logger.verbose(`Fetching guild economy.${route} data for ${guild.name} (ID:${guild.id})`);
  const res = await guildDataStore.economy[route].get(guild.id);
  return res;
};
async function saveEconomyUserData(guild, route, data) {
  logger.verbose(`Updating guild economy.${route} data for ${guild.name} (ID:${guild.id})`);
  await guildDataStore.economy[route].set(guild.id, data);
};
async function readGuildModData(guild) {
  logger.verbose(`Fetching guild moderation data for ${guild.name} (ID:${guild.id}).`);
  const res = await guildDataStore.offenses.get(guild.id);
  return res;
};
async function saveGuildModData(data, guild) {
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
async function saveGuildVoiceData(data, guild) {
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
async function saveGuildTrackerData(data, guild) {
  logger.verbose(`Updating guild trackers data for ${guild.name} (ID:${guild.id}).`);
  await guildDataStore.trackers.set(guild.id, data);
  logger.verbose(`Updated guild trackers data for ${guild.name} (ID:${guild.id}).`);
};
async function deleteGuildTrackerData(guild) {
  logger.verbose(`Removing guild trackers data for ${guild.name} (ID:${guild.id}).`);
  await guildDataStore.trackers.delete(guild.id);
};
async function resetGuildData() {
  logger.verbose('Clearing all guild data.');
  for (const endpoint of Object.keys(guildDataStore)) {
    if (!guildDataStore[endpoint] ?.set) {
      for (const subroute of Object.keys(guildDataStore[endpoint])) {
        guildDataStore[endpoint][subroute].clear();
      };
    } else {
      guildDataStore[endpoint].clear();
    };
  };
  logger.verbose('Reinitializing guild data.');
  await generateGuildData();
};

module.exports.storage = {
  data: {
    economy: {
      sync: syncEconomyUserData,
      get: readEconomyUserData,
      set: saveEconomyUserData
    },
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
    },
    init: generateGuildData,
    reset: resetGuildData
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