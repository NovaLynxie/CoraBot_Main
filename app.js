const logger = require('./core/plugins/winstonLogger');
const { readdirSync } = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { crashReporter } = require('./core/handlers/crashReporter');
const { settingsHandlers, dataHandlers } = require('./core/handlers/keyvManager');
const { 
  clearClientSettings, clearGuildSettings,
  generateClientSettings, generateGuildSettings,
  saveClientSettings, saveGuildSettings,
  readClientSettings, readGuildSettings, deleteGuildSettings
} = settingsHandlers;
const {
  readGuildData, saveGuildData, deleteGuildData, generateGuildData
} = dataHandlers;
const {config, credentials} = require('./core/handlers/bootLoader');
const {globalPrefix, ownerIDs, useLegacyURL, debug} = config;
const {discordToken} = credentials; 

// Initialise client instance.
const client = new Client({
  // bot prefix and owners.
  globalPrefix: globalPrefix,
  owners: ownerIDs,
  // bot intents. (required!)
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_VOICE_STATES
  ]
});

if (useLegacyURL) {
  logger.warn('Using Legacy API domain. This is not recommended!')
  client.options.http.api = "https://discordapp.com/api"
};

// Bind all handlers to client object.
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
    init: generateGuildSettings    
  }
};
client.data = {
  get: readGuildData,
  set: saveGuildData,
  init: generateGuildData,
  delete: deleteGuildData
}

// Initialize commands collection objects.
let commandCollections = ["prefixcmds", "slashcmds"];
commandCollections.forEach(collection => client[collection] = new Collection());

// Load in events from event files.
const eventFiles = readdirSync('./core/events').filter(file => file.endsWith('.js'));
// Event handler to process discord event triggers.
for (const file of eventFiles) {
	const event = require(`./core/events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	};
};

// Catch unhandled exceptions and rejections not caught by my code to avoid crashes.
process.on('unhandledRejection', error => {
  logger.warn(`Uncaught Promise Rejection Exception thrown!`);
  logger.error(`Caused by: ${error.message}`);
  logger.debug(error.stack);
});
process.on('uncaughtException', error => {
  // Error thrown and logged to console window.
  crashReporter(error); // prepare crash report with error data.
  logger.error(`Bot crashed! Generating a crash report.`);
  logger.error(error.message); logger.debug(error.stack);
  setTimeout(() => {process.exit(1);}, 5000);  
});

// Initialize timers and reference them here.
let rateLimitWarn = setTimeout(() => {
  logger.warn('Bot taking longer than normal to connect. Maybe bot is rate limited?');
}, 10 * 1000);
// Bind timers to property 'timers' on client object.
client.timers = {rateLimitWarn};

logger.info('Connecting to Discord.');
client.login(discordToken).then(() => {
  logger.debug('Awaiting API Response...');
}).catch((error)=>{
  clearTimeout(client.timers.rateLimitWarn); // clear if bot fails to login with invalid token.
  logger.warn('Unable to connect to Discord!');
  logger.error(error.message); logger.debug(error.stack);
});
