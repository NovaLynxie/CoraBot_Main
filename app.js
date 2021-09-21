const logger = require('./core/plugins/winstonLogger');
const { readdirSync } = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { crashReporter } = require('./core/handlers/crashReporter');
const { settingsHandlers, dataHandlers } = require('./core/handlers/keyvManager');
const {
	clearClientSettings, clearGuildSettings,
	generateClientSettings, generateGuildSettings,
	saveClientSettings, saveGuildSettings,
	readClientSettings, readGuildSettings, deleteGuildSettings,
} = settingsHandlers;
const {
	readGuildData, saveGuildData, deleteGuildData, generateGuildData,
} = dataHandlers;
const { config, credentials } = require('./core/handlers/bootLoader');
const { globalPrefix, ownerIDs, useLegacyURL, debug } = config;
const { discordToken } = credentials;
logger.init('Spinning up bot instance...');
// Initialise client instance
const client = new Client({
	globalPrefix: globalPrefix,
	owners: ownerIDs,
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_PRESENCES,
		Intents.FLAGS.GUILD_VOICE_STATES,
	],
});
if (useLegacyURL) {
	logger.warn('Using Legacy API domain. This is not recommended!');
  logger.debug('Switching http API to legacy domain.');
	client.options.http.api = 'https://discordapp.com/api';
} else { logger.debug('Using default API domain.'); };
// Client handlers bind to bot instance
client.settings = {
	clear: clearClientSettings,
	get: readClientSettings,
	set: saveClientSettings,
	init: generateClientSettings,
	guild: {
		clear: clearGuildSettings,
		delete: deleteGuildSettings,
		get: readGuildSettings,
		set: saveGuildSettings,
		init: generateGuildSettings,
	}
};
client.data = {
	get: readGuildData,
	set: saveGuildData,
	init: generateGuildData,
	delete: deleteGuildData
};
// Initialize commands collection objects.
const commandCollections = ['prefixcmds', 'slashcmds'];
commandCollections.forEach(collection => client[collection] = new Collection());
const eventFiles = readdirSync('./core/events').filter(file => file.endsWith('.js'));
// Event handler to process discord event triggers.
for (const file of eventFiles) {
	const event = require(`./core/events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	}
	else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}
// Unhandled error handling in process
process.on('unhandledRejection', error => {
	logger.warn('Uncaught Promise Rejection Exception thrown!');
	logger.error(`Caused by: ${error.message}`);
	logger.debug(error.stack);
});
process.on('uncaughtException', error => {
	crashReporter(error);
	logger.error('Bot crashed! Generating a crash report.');
	logger.error(error.message); logger.debug(error.stack);
	setTimeout(() => {process.exit(1);}, 5000);
});
// Client timers references
const apiConnectWarn = setTimeout(() => {
	logger.warn('Bot taking longer than normal to connect.');
  logger.warn('Possibly slow connection or rate limited?');
}, 10 * 1000);
client.timers = { apiConnectWarn };
logger.info('Connecting to Discord.');
client.login(discordToken).then(() => {
	logger.debug('Awaiting API Response...');
}).catch((error) => {
	clearTimeout(client.timers.rateLimitWarn); 
	logger.warn('Unable to connect to Discord!');
	logger.error(error.message); logger.debug(error.stack);
});