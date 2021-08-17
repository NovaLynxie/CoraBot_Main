const logger = require('../plugins/winstonplugin');
const { readdirSync } = require('fs');
const { credentials } = require('./bootloader');
const { discordToken } = credentials;

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
};

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
};

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