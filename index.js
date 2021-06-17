// ================== PROCESS.ENV =====================
require('dotenv').config() // load .env as early as possible
// ================= LOGGING MODULE ===================
const logger = require('./cora/providers/WinstonPlugin');
// fetch package version tag and report in console as app version.
const {version} = require('./package.json');
logger.init(`CoraBot v${version}`);
// ================= START BOT CODE ===================
const { CommandoClient, SQLiteProvider } = require('discord.js-commando');
const { Structures } = require('discord.js');
// ------------------- Bot's Modules ------------------
const fs = require('fs');
// Requiring bot's own modules here for usage.
logger.init('Initialising bot systems...')
// Start websrv.js to handle heartbeat ping requests. (eg. UptimeRobot)
require('./cora/internal/websrv.js');
// Boot.js used to handle bot startup and config loader.
const {config, tokens} = require('./cora/handlers/bootLoader.js');
const {prefix, owners, debug} = config;
const {discordToken} = tokens;
// Load bot handlers here before bot starts.
const crashReporter = require('./cora/handlers/crashReporter.js');
logger.debug('Loaded crashReporter functions from crashReporter.js');
// ------------------- Bot's Modules ------------------
// Load path module for code file to use file directories.
const path = require('path'); 
// Load sqlite modules for database management functions.
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

Structures.extend('Guild', Guild => {
  class MusicGuild extends Guild {
    constructor(bot, data){
      super(bot, data);
        this.musicData = {
          queue: [],
          isPlaying: false,
          nowPlaying: null,
          songDispatcher: null,
          radioDispatcher: null,
          volume: 1
        };
      }
  }
  return MusicGuild;
});

const client = new CommandoClient({
  commandPrefix: prefix,
  owner: owners,
  invite: '',
});
const eventFiles = fs.readdirSync('./cora/events').filter(file => file.endsWith('.js'));

client.setProvider(
  // Set providers to store guild settings like prefix across restarts.
  sqlite.open({ filename: 'data/storage/corabot.db', driver: sqlite3.Database }).then(db => new SQLiteProvider(db)).catch((err) => {  
    logger.error(err);
    logger.warn(`Unable to create database 'corabot.db'. Is process missing permissions?`);
    logger.warn(`Please ensure './data' directory exists in bot's root directory and has read/write permissions enabled!`);
  })
)

client.registry
  .registerDefaultTypes()
  .registerGroups([
    ['admin', 'Admin'],
    ['core', 'Core'],
    //['econ', 'Economy'], // Disabled - Missing storage method.
    ['image','Images'],
    ['info', 'Information'],
    ['misc', 'Miscellaneous'],
    ['music', 'Music'], 
    //['social', 'Social'], // Disabled - Does not have any commands.
    ['support', 'Support'],
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({
      unknownCommand: false,
      help: false,
  })
  .registerCommandsIn(
      path.join(__dirname, './cora/commands')
  );

for (const file of eventFiles) {
	const event = require(`./cora/events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
	}
}

process.on('unhandledRejection', error => {
    logger.warn(`Uncaught Promise Rejection Exception thrown!`)
    logger.error(`Caused by: ${error.message}`)
    if (debug == true) {
      logger.debug(error.stack)
    }
});
process.on('uncaughtException', error => {
    crashReporter(error);
    logger.error(`Bot crashed! Check the logs directory for crash report!`); // Error thrown and logged to console window.
});


logger.init(`Connecting to Discord...`);
//logger.verbose(`discordToken -> ${discordToken}`);
client.login(discordToken).then(
  logger.debug(`Awaiting for Discord API response...`)
).catch(err => {
    logger.error('Bot token is INVALID! Login aborted.')
    logger.error('Please check the bot token in config vars and restart the bot.')
    logger.error(err);
});
