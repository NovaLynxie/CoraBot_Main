const logger = require('./core/plugins/winstonplugin');
const { Client, Collection, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { readdirSync } = require('fs'); 

const {credentials} = require('./core/modules/bootloader');
const {discordToken} = credentials;

// Initialise client instance.
const client = new Client({ 
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
  ]
});
//
//const matrix = new Keyv('sqlite://data/storage/matrix.db');
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
	}
};

// Define command directory paths here.
const prefixCmdDir = './core/commands/prefixcmds';
const slashCmdDir = './core/commands/slashcmds';

try {
  // Load prefix-based commands from command files.
  readdirSync(prefixCmdDir).forEach(subDir => {
    
    let dirPath = `${msgCmdDir}/${subDir}/`;
    var cmdfiles = readdirSync(dirPath).filter(file => file.endsWith('.js'));
    for (const file of cmdfiles) {
      logger.debug(`Parsing ${file} of ${subDir} in prefixcmds`);
      logger.debug(`cmdfile -> ${file}`);
      const cmd = require(`${dirPath}/${file}`);
      if (cmd.data) {
        if (typeof cmd.data.name === "string" && typeof cmd.data.category === "string") {
          client.prefixcmds.set(cmd.data.name, cmd);
        } else {
          logger.error('Command name tag invalid type!');
        };
      } else {
        logger.error('Missing cmd.data! Skipping invalid command file.');
      };
    };
  });
} catch (error) {
  logger.error(error.message); logger.debug(error.stack);
  logger.error('Unable to find prefixcmds directory!');
  logger.warn('It is either missing or a permission error has occured.');
  logger.warn("Skipping loading directory 'prefixcmds'.");
}

// Load slash commands from command files.
let commands = [];
try {
  readdirSync(slashCmdDir).forEach(subDir => {
    let dirPath = `${slashCmdDir}/${subDir}/`;
    var cmdfiles = readdirSync(dirPath).filter(file => file.endsWith('.js'));
    for (const file of cmdfiles) {
      logger.debug(`Parsing ${file} of ${subDir} in slashcmds`);
      logger.debug(`cmdfile -> ${file}`);
      const cmd = require(`${dirPath}/${file}`);

      commands.push(cmd.data);

      if (cmd.data) {
        if (typeof cmd.data.name === "string" && typeof cmd.data.category === "string") {
          client.slashcmds.set(cmd.data.name, cmd);
        } else {
          logger.error('Command name tag invalid type!');
        };
      } else {
        logger.error('Missing cmd.data! Skipping invalid command file.');
      };
    };
  });
} catch (error) {  
  logger.error(error.message); logger.debug(error.stack);
  logger.error('Unable to find slashcmds directory!');
  logger.warn('It is either missing or a permission error has occured.');
  logger.warn("Skipping loading directory 'slashcmds'.");
}

let clientId = '362941748923727872', guildId = process.env.devGuildId || '694830379756027924';
const rest =  new REST({ version: '9' }).setToken(discordToken);

(async () => {
  try {
    logger.debug('Started refreshing application (/) commands.');
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );
    logger.debug('Successfully reloaded application (/) commands.');
  } catch (error) {
    logger.error('Unable to refresh application (/) commands!')
    logger.error(`Discord API Error! Err. Code: ${error.code} Response: ${error.status} - ${error.message}`);
  }
})();

// Catch unhandled exceptions and rejections not caught by my code to avoid crashes.
process.on('unhandledRejection', error => {
  logger.warn(`Uncaught Promise Rejection Exception thrown!`);
  logger.error(`Caused by: ${error.message}`);
  logger.debug(error.stack);
});
process.on('uncaughtException', error => {
  // Error thrown and logged to console window.
  logger.error(`Bot crashed! Check below for crash error data!`);
  logger.error(error);
});

logger.info('Logging into Discord.')
client.login(discordToken).then(logger.debug('Awaiting API Response...'))
.catch((error)=>{
  logger.warn('Unable to connect to Discord!');
  logger.error(error.message);
});