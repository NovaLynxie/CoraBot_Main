const logger = require('../plugins/winstonlogger');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { readdirSync } = require('fs');
const { credentials } = require('./bootloader');
const { discordToken } = credentials;

// Define command directory paths here.
const prefixCmdDir = './core/commands/prefixcmds';
const slashCmdDir = './core/commands/slashcmds';

async function loadPrefixCmds(client) { // this is currently unused and depreciated till further notice.
  logger.warn('Prefix commands are not fully supported! Proceed with caution.')
  try {
    // Load prefix-based commands from command files.
    readdirSync(prefixCmdDir).forEach(subDir => {
      let dirPath = `${prefixCmdDir}/${subDir}/`;
      var cmdfiles = readdirSync(dirPath).filter(file => file.endsWith('.js'));      
      for (const file of cmdfiles) {
        logger.debug(`Parsing ${file} of ${subDir} in prefixcmds`);
        logger.debug(`cmdfile -> ${file}`);
        try {
          const cmd = require(`../commands/prefixcmds/${subDir}/${file}`);
          if (cmd.data) {
            if (typeof cmd.data.name === "string" && typeof cmd.data.category === "string") {
              client.prefixcmds.set(cmd.data.name, cmd);
            } else {
              logger.error('Command name tag invalid type!');
            };
          } else {
            logger.error('Missing cmd.data! Skipping invalid command file.');
          };
        } catch (error) {
          
        };        
      };
    });
  } catch (error) {
    if (error.code === 'ENOENT') {      
      logger.fatal('Unable to find prefixcmds directory!')
    } else
    if (error.message.indexOf('Cannot find module') > -1) {
      logger.fatal('Unable to find or load specified command file!');
      logger.warn('It is either missing or a permission error has occured.');
    } else
    if (error.message.indexOf('Unexpected token') > -1) {
      logger.error('Errored while loading a command file');
      logger.error(error.message); logger.debug(error.stack);
    } else {
      logger.error('Unknown error occured while loading the commands!');
      logger.error(error.message); logger.debug(error.stack);
    };
    logger.warn("Stopped loading directory 'prefixcmds'. Some commands may fail to respond.");
  };
}
async function loadSlashCmds(client) {
  // Load slash commands from command files.
  let commands = [];
  try {
    readdirSync(slashCmdDir).forEach(subDir => {
      let dirPath = `${slashCmdDir}/${subDir}/`;
      var cmdfiles = readdirSync(dirPath).filter(file => file.endsWith('.js'));
      for (const file of cmdfiles) {
        logger.debug(`Parsing ${file} of ${subDir} in slashcmds`);
        logger.debug(`cmdfile -> ${file}`);
        const cmd = require(`../commands/slashcmds/${subDir}/${file}`);

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
    if (error.code === 'ENOENT') {      
      logger.fatal('Unable to find slashcmds directory!')
    } else
    if (error.message.indexOf('Cannot find module') > -1) {
      logger.fatal('Unable to find or load specified command file!');
      logger.warn('It is either missing or a permission error has occured.');
    } else
    if (error.message.indexOf('Unexpected token') > -1) {
      logger.error('Errored while loading a command file');
      logger.error(error.message); logger.debug(error.stack);
    } else {
      logger.error('Unknown error occured while loading the commands!');
      logger.error(error.message); logger.debug(error.stack);
    };
    logger.warn("Stopped loading directory 'slashcmds'. Some commands may fail to respond.");
  };

  let clientId = process.env.clientId || client.user.id, guildId = process.env.devGuildId || '694830379756027924';
  const rest =  new REST({ version: '9' }).setToken(discordToken);
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
  };
}

module.exports = {loadPrefixCmds, loadSlashCmds};