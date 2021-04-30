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
// Boot.js used to handle bot startup and config loader.
const {config} = require('./cora/handlers/bootLoader.js');
const {prefix, debug, botToken, ownerID} = config;
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
  owner: ownerID,
  invite: '',
});

const eventFiles = fs.readdirSync('./cora/events').filter(file => file.endsWith('.js'));

client.setProvider(
  // Set providers to store guild settings like prefix across restarts.
  sqlite.open({ filename: 'cora/cache/corabot.db', driver: sqlite3.Database }).then(db => new SQLiteProvider(db)).catch((logger.error))
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
    ['music', 'Music'], // Experimental! - May have some unexpected errors.
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
      //path.join(__dirname, './cora_modules/commands')
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
    //console.log(`Uncaught Promise Rejection Detected! ${error}`)
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


client.on('guildMemberUpdate', (oldMember, newMember) => {
    const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
    if (removedRoles.size > 0) {
        logger.info(`Role ${removedRoles.map(r=>r.name)} removed from ${oldMember.displayName}.`)
    };
    const addedRoles = newMember.roles.cache.filter(role=>!oldMember.roles.cache.has(role.id));
    if (addedRoles.size > 0) {
        logger.info(`Role ${addedRoles.map(r=>r.name)} added to ${oldMember.displayName}.`)
    };
});

logger.init(`Connecting to Discord...`);
client.login(botToken).then(
  logger.debug(`Awaiting for Discord API response...`)
).catch(err => {
    logger.error('Bot token is INVALID! Login aborted.')
    logger.error('Please check the bot token in config vars and restart the bot.')
    logger.error(err);
});
