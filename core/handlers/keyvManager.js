const logger = require('../utils/winstonLogger');
const Keyv = require('@keyvhq/core');
const KeyvSQLite = require('@keyvhq/sqlite');
const clientPrefStore = new Keyv({ store: new KeyvSQLite({ uri: 'sqlite://data/settings.db' }), namespace: 'clientSettings' });
const guildPrefStore = new Keyv({ store: new KeyvSQLite({ uri: 'sqlite://data/settings.db' }), namespace: 'guildSettings' });
const guildDataStore = new Keyv({ store: new KeyvSQLite({ uri: 'sqlite://data/guilds.db' }) });
const guildDataStore = {
  general: 
  moderation: 
}
logger.verbose(`clientPrefStore: ${JSON.stringify(clientPrefStore, null, 2)}`);
logger.verbose(`guildPrefStore: ${JSON.stringify(guildPrefStore, null, 2)}`);
logger.verbose(`guildDataStore: ${JSON.stringify(guildDataStore, null, 2)}`);
const clientSettingsTemplate = require('../assets/templates/database/clientSettings.json');
const guildSettingsTemplate = require('../assets/templates/database/guildSettings.json');
const guildDataTemplate = require('../assets/templates/database/guildData.json');
async function generateGuildSettings(guildIDs) {
	logger.verbose('Preparing to check guild settings now...');
	guildIDs.forEach(async (guildID) => {
		logger.verbose(`Checking ${guildID} of guildIDs`);
		const settings = await guildPrefStore.get(guildID);
		if (settings) {
			logger.verbose(`Guild ${guildID} already has settings defined!`);
      logger.verbose(`Checking settings for ${guildID} for any updates.`);
      const guildSettings = Object.keys(guildSettingsTemplate);
      guildSettings.forEach(key => {
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
		}
	});
	logger.verbose('Finished checking guild settings.');
	logger.info('Guild settings are now available.');
};
async function generateClientSettings() {
	logger.verbose('Preparing to generate bot settings now...');
	const settings = await clientPrefStore.get('botSettings');
	if (settings) {
		logger.verbose('Bot settings are already set! Skipping.');
	}
	else {
		logger.verbose('Bot settings not yet set! Adding new settings now.');
	}
	await clientPrefStore.set('clientSettings', clientSettingsTemplate);
	logger.verbose('Finished checking bot settings.');
	logger.info('Bot settings are now available.');
};
async function saveClientSettings(settings, client) {
  logger.verbose(JSON.stringify(settings));
	logger.verbose(`Writing new settings for ${client.user.tag} to database.`);
	await guildPrefStore.set('clientSettings', settings);
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
async function generateGuildData(guildIDs) {
	logger.debug('Preparing to check guild data now...');
	guildIDs.forEach(async (guildID) => {
		logger.verbose(`Checking ${guildID} of guildIDs`);
		const data = await guildDataStore.get(guildID);
		if (data) {
			logger.verbose(`Guild ${guildID} data entries already added!`);
			logger.verbose(`Checking datastore for ${guildID} for any updates.`);
      const guildData = Object.keys(guildDataTemplate);
      guildData.forEach(key => {
        if (data[key] === undefined) {
          logger.verbose(`Data property '${key}' not found! Adding new data property.`)
          data[key] = guildDataTemplate[key];
        } else {
          logger.verbose(`Data key '${key}' already exists!`);
        };
      });
			await guildDataStore.set(guildID, data);
			return;
		} else {
			logger.verbose(`Adding new data entries for ${guildID} now...`);
			await guildDataStore.set(guildID, guildDataTemplate);
		};
	});
	logger.debug('Finished checking guild settings.');
	logger.info('Guild data is now available.');
};
async function readGuildData(guild) {
	logger.verbose(`Fetching guild data for ${guild.name} (ID:${guild.id}).`);
	const res = await guildDataStore.get(guild.id);
	return res;
};
async function saveGuildData(data, guild) {
	logger.verbose(`Updating guild data for ${guild.name} (ID:${guild.id}).`);
	await guildDataStore.set(guild.id, data);
	logger.verbose(`Updated guild data for ${guild.name} (ID:${guild.id}).`);
};
async function deleteGuildData(guild) {
	logger.verbose(`Removing guild data for ${guild.name} (ID:${guild.id}).`);
	await guildDataStore.delete(guild.id);
};
async function resetGuildData() {
	logger.verbose('Removing all guild data.');
	await guildDataStore.clear();
};
module.exports.settingsHandlers = {
	clearClientSettings, clearGuildSettings,
	generateClientSettings, generateGuildSettings,
	saveClientSettings, saveGuildSettings,
	readClientSettings, readGuildSettings, deleteGuildSettings,
};
module.exports.dataHandlers = {
	readGuildData, saveGuildData, deleteGuildData, generateGuildData, resetGuildData,
};