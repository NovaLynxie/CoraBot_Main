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
          if (cmdDataJSON) {
            if (typeof cmdDataJSON.name === "string" && typeof cmdDataJSON.category === "string") {
              client.prefixcmds.set(cmdDataJSON.name, cmd);
            } else {
              logger.error('Command name tag invalid type!');
            };
          } else {
            logger.error('Missing cmdDataJSON! Skipping invalid command file.');
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
      logger.data(JSON.stringify(cmdfiles));
      for (const file of cmdfiles) {
        logger.debug(`Parsing ${file} of ${subDir} in slashcmds`);
        logger.debug(`cmdfile -> ${file}`);

        // Require command file here.
        const cmd = require(`../commands/slashcmds/${subDir}/${file}`);
        const cmdDataJSON = cmd.data.toJSON();
        // Error checking if command has no syntax errors thrown when requiring the file.
        // If no name or empty field, don't load the commmand.
        if (!cmdDataJSON.name || cmdDataJSON.name.trim() === "") return logger.error(`Command ${file} missing name property or no name provided!`);
        // If no category, warn that help command cannot show information for it.
        //if (!cmdDataJSON.category) logger.warn(`Command ${file} missing category! Help command will not show this command.`); // no category available... (-_-)
        // If no execute function, do not load command as this will do nothing without it.
        if (!cmd.execute) return logger.error(`Command ${file} missing execute() function!`);
        // If all goes well, push cmdDataJSON into the commands array for updating application commands later.
        commands.push(cmdDataJSON);

        if (cmdDataJSON) {
          if (typeof cmdDataJSON.name === "string") {
            client.slashcmds.set(cmdDataJSON.name, cmd);
          } else {
            logger.error('Command name tag invalid type!');
          };
        } else {
          logger.error('Missing command data! Skipping invalid command file.');
        };
      };
    });
  } catch (error) {  
    if (error.code === 'ENOENT') {      
      logger.fatal('Unable to find slashcmds directory!');
    } else
    if (error.message.indexOf('Cannot find module') > -1) {
      logger.fatal('Unable to find or load specified command file!');
      logger.warn('It is either missing or a permission error has occured.');
      logger.debug(error.stack);
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

  const rest =  new REST({ version: '9' }).setToken(discordToken);
  /* 
  // Load commands into client as global commands.
  try {
    logger.debug(`Started refreshing application (/) commands for ${client.user.tag}.`);
    await rest.put(
      Routes.applicationCommands(process.env.clientId || client.user.id),
      { body: commands },
    );
    logger.debug(`Successfully reloaded application (/) commands for ${client.user.tag}.`);
  } catch (error) {
    logger.error('Unable to refresh application (/) commands!')
    logger.error(`Discord API Error! Err. Code: ${error.code} Response: ${error.status} - ${error.message}`);
  };
  */
  // Load commands into guilds as guild commands.
  client.guilds.cache.forEach(async guild => {
    try {
      logger.debug(`Started refreshing application (/) commands in ${guild.name}.`);
      await rest.put(
        Routes.applicationGuildCommands(process.env.clientId || client.user.id, guild.id),
        { body: commands },
      );
      logger.debug(`Successfully reloaded application (/) commands in ${guild.name}.`);
    } catch (error) {
      logger.error('Unable to refresh application (/) commands!')
      logger.error(`Discord API Error! Err. Code: ${error.code} Response: ${error.status} - ${error.message}`);
    };
  });  
};

module.exports = {loadPrefixCmds, loadSlashCmds};