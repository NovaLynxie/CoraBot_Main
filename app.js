const logger = require('./core/plugins/winstonplugin');
const { readdirSync } = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { loadPrefixCmds, loadSlashCmds } = require('./core/handlers/cmdloader');

const {config, credentials} = require('./core/handlers/bootloader');
const {discordToken} = credentials; const {useLegacyURL} = config;

// Initialise client instance.
const client = new Client({ 
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ]
});

if (useLegacyURL) {
  logger.warn('Using Legacy API domain. This is not recommended!')
  client.options.http.api = "https://discordapp.com/api"
};

// Commands collection object.
let commandCollections = ["prefixcmds", "slashcmds"];
commandCollections.forEach(data => client[data] = new Collection());

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

// Load commands using functions in cmdloader.
loadPrefixCmds(client); // load prefixed commands.
loadSlashCmds(client); // load slash commands.

// Catch unhandled exceptions and rejections not caught by my code to avoid crashes.
process.on('unhandledRejection', error => {
  logger.warn(`Uncaught Promise Rejection Exception thrown!`);
  logger.error(`Caused by: ${error.message}`);
  logger.debug(error.stack);
});
process.on('uncaughtException', error => {
  // Error thrown and logged to console window.
  logger.error(`Bot crashed! Check below for crash error data!`);
  logger.error(error.message); logger.debug(error.stack);
  process.exit(1);
});

// Initialize timers and reference them here.
let rateLimitWarn = setTimeout(() => {
  logger.warn('Bot taking longer than normal to connect. Maybe bot is rate limited?');
}, 30 * 1000);
// Bind timers to property 'timers' on client object.
client.timers = {rateLimitWarn};

logger.info('Logging into Discord.');
client.login(discordToken).then(() => {
  logger.debug('Awaiting API Response...');
})
.catch((error)=>{
  logger.warn('Unable to connect to Discord!');
  logger.error(error.message);
});
