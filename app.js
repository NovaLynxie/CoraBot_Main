const logger = require('./core/plugins/winstonlogger');
const { readdirSync } = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { Manager } = require('erela.js');
const { crashReporter } = require('./core/handlers/crashreporter');
const { 
  clearClientSettings, clearGuildSettings,
  generateClientSettings, generateGuildSettings,
  saveClientSettings, saveGuildSettings,
  readClientSettings, readGuildSettings, deleteGuildSettings
} = require('./core/handlers/settingsmanager');
const {config, credentials} = require('./core/handlers/bootloader');
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
    Intents.FLAGS.GUILD_PRESENCES
  ]
});

// Configure some options for music node.
const musicNodes = [
  {
    host: "localhost",
    password: "lynxfluff",
    port: 2333
  }
];

if (useLegacyURL) {
  logger.warn('Using Legacy API domain. This is not recommended!')
  client.options.http.api = "https://discordapp.com/api"
};

// Assign Manager to the client object.
client.manager = new Manager({
  // music nodes here.
  nodes: musicNodes,
  send: (id, payload) => {
    const guild = client.guilds.cache.get(id);
    if (guild) guild.shard.send(payload);
  }
}) 

// Assign settings handlers to client object.
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
}

// Initialize commands collection objects.
let commandCollections = ["prefixcmds", "slashcmds"];
commandCollections.forEach(collection => client[collection] = new Collection());

// Load in events from event files.
const discordEventFiles = readdirSync('./core/events').filter(file => file.endsWith('.js'));
const managerEventFiles = readdirSync('./core/events/music').filter(file => file.endsWith('.js'));
// Discord Client events handler to process discord event triggers.
for (const eventFile of discordEventFiles) {
	const event = require(`./core/events/${eventFile}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	};
};

// Music Manager events handler to process erela.js event triggers.
for ( const eventFile of managerEventFiles) {
  const event = require(`./core/events/music/${eventFile}`);
  if (event.once) {
    client.manager.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.manager.on(event.name, (...args) => event.execute(...args, client));
  };
}
// Client Manager Events.
client.manager.on("nodeConnect", node => {
  logger.debug(`Node "${node.options.identifier}" connected!`);  
})

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

logger.info('Logging into Discord.');
client.login(discordToken).then(() => {
  logger.debug('Awaiting API Response...');
})
.catch((error)=>{
  clearTimeout(client.timers.rateLimitWarn); // clear if bot fails to login with invalid token.
  logger.warn('Unable to connect to Discord!');
  logger.error(error.message); logger.debug(error.stack);
});
