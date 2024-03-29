const logger = require('../utils/winstonLogger');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { readdirSync } = require('fs');
const { config, credentials } = require('./bootLoader');
const { forceUpdateCmds } = config;
const { discordToken } = credentials;
const botCmdsDir = './lib/commands';
function requireReloader(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
};
async function loadAllCmds(client, botInitStage = false) {
  const commands = [], counters = { success: 0, failed: 0 };
  try {
    logger.debug('Started reloading all available commands!');
    readdirSync(botCmdsDir).forEach(subDir => {
      const dirPath = `${botCmdsDir}/${subDir}/`;
      const cmdfiles = readdirSync(dirPath).filter(file => file.endsWith('.js'));
      logger.data(JSON.stringify(cmdfiles));
      for (const file of cmdfiles) {
        logger.debug(`Parsing ${file} of ${subDir} in slashcmds`);
        logger.debug(`cmdfile -> ${file}`);
        try {
          const cmd = requireReloader(`../commands/${subDir}/${file}`);
          const cmdDataJSON = cmd.data.toJSON();
          if (!cmdDataJSON.name || cmdDataJSON.name.trim() === '') return logger.error(`Command ${file} missing name property or no name provided!`);
          if (!cmd.execute) return logger.error(`Command ${file} missing execute() function!`);
          commands.push(cmdDataJSON);
          if (cmdDataJSON) {
            if (typeof cmdDataJSON.name === 'string') {
              client.commands.set(cmdDataJSON.name, cmd);
              counters.success++;
            }
            else {
              logger.error('Command name tag invalid type!');
            };
          }
          else {
            logger.error('Missing command data! Skipping invalid command file.');
          };
        } catch (error) {
          logger.error(`Error occured while loading command ${file}!`);
          logger.error(error.message); logger.debug(error.stack);
          counters.failed++;
        };
      };
    });
  } catch (error) {
    logger.error('Command Loader Error! Failed to reload ALL commands!');
    if (error.code === 'ENOENT') {
      logger.fatal('Unable to find commands directory!');
      throw error;
    } else
      if (error.message.indexOf('Cannot find module') > -1) {
        logger.fatal('Unable to find or load specified command file or its modules!');
        logger.warn('Either missing or incorrect dependency declarations or wrong command filepath.');
        logger.debug(error.stack);
      } else
        if (error.message.indexOf('Unexpected token') > -1) {
          logger.error('Errored while loading a command file');
          logger.error(error.message); logger.debug(error.stack);
        } else {
          logger.error('Unknown error occured while loading the commands!');
          logger.error(error.message); logger.debug(error.stack);
        }
    logger.warn('Aborted command loading due to error! Some interactions may fail.');
  };
  if (botInitStage && forceUpdateCmds) {
    logger.debug('Syncing currently loaded bot commands with client application commands!');
    const rest = new REST({ version: '9' }).setToken(discordToken);
    try {
      logger.debug(`Started updating client application (/) commands for ${client.user.tag}.`);
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands },
      );
      logger.debug(`Successfully updated client application (/) commands for ${client.user.tag}!`);
      logger.info('Global slash commands update completed!');
      logger.warn('It may take up to an hour to sync changes across Discord.');
    } catch (error) {
      logger.error('Failed to update application (/) commands!')
      logger.error(`Discord API Error! Err. Code: ${error.code} Response: ${error.status} - ${error.message}`);
    };
  };
  return counters;
};
async function loadCommand(client, cmdName) {
  try {
    logger.debug(`Searching for command matching ${cmdName}...`);
    for (const subDir of readdirSync(botCmdsDir)) {
      const dirPath = `${botCmdsDir}/${subDir}/`;
      const cmds = readdirSync(dirPath).filter(file => file.endsWith('.js'));
      logger.verbose(`cmdsArr: ${cmds}`);
      const file = cmds[cmds.indexOf(`${cmdName}.js`)];
      logger.verbose(`cmdFile: ${file}`);
      try {
        if (file) {
          const cmdData = requireReloader(`../commands/${subDir}/${file}`);
          logger.verbose(JSON.stringify(cmdData, null, 2));
          const cmdJSON = cmdData.data.toJSON();
          logger.verbose(JSON.stringify(cmdJSON, null, 2));
          client.commands.set(cmdJSON.name, cmdData); break;
        };
      } catch (error) {
        logger.error(`Error occured while loading command ${file}!`);
        logger.debug(error.stack); throw error;
      };
    };
    logger.debug(`Command ${cmdName} reloaded successfully!`);
  } catch (error) {
    logger.error('Command Loader Error! Failed to reload requested command!');
    logger.debug(error.stack); throw error;
  };
};
module.exports.cmdLoader = { reloadAll: loadAllCmds, reloadCmd: loadCommand };