const logger = require('../plugins/winstonLogger');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { readdirSync } = require('fs');
const { config, credentials } = require('./bootLoader');
const { forceUpdateCmds } = config;
const { discordToken } = credentials;

// Define command directory paths here.
const prefixCmdDir = './core/commands/prefixcmds';
const slashCmdDir = './core/commands/slashcmds';
const botCmdsDir = './core/commands/';

async function loadBotCmds (client) {
  // Load slash commands from command files.
	const commands = [];
	try {
		readdirSync(botCmdsDir).forEach(subDir => {
			const dirPath = `${botCmdsDir}/${subDir}/`;
			const cmdfiles = readdirSync(dirPath).filter(file => file.endsWith('.js'));
			logger.data(JSON.stringify(cmdfiles));
			for (const file of cmdfiles) {
				logger.debug(`Parsing ${file} of ${subDir} in slashcmds`);
				logger.debug(`cmdfile -> ${file}`);
				// Require command file here.
				const cmd = require(`../commands/${subDir}/${file}`);
				const cmdDataJSON = cmd.data.toJSON();
				// Error checking if command has no syntax errors thrown when requiring the file.
				// If no name or empty field, don't load the commmand.
				if (!cmdDataJSON.name || cmdDataJSON.name.trim() === '') return logger.error(`Command ${file} missing name property or no name provided!`);
				// If no execute function, do not load command as this will do nothing without it.
				if (!cmd.execute) return logger.error(`Command ${file} missing execute() function!`);
				// If all goes well, push cmdDataJSON into the commands array for updating application commands later.
				commands.push(cmdDataJSON);
				if (cmdDataJSON) {
					if (typeof cmdDataJSON.name === 'string') {
						client.slashcmds.set(cmdDataJSON.name, cmd);
					}
					else {
						logger.error('Command name tag invalid type!');
					};
				}
				else {
					logger.error('Missing command data! Skipping invalid command file.');
				};
			};
		});
	}	catch (error) {
		if (error.code === 'ENOENT') {
			logger.fatal('Unable to find slashcmds directory!');
		}
		else
		if (error.message.indexOf('Cannot find module') > -1) {
			logger.fatal('Unable to find or load specified command file!');
			logger.warn('It is either missing or a permission error has occured.');
			logger.debug(error.stack);
		}
		else
		if (error.message.indexOf('Unexpected token') > -1) {
			logger.error('Errored while loading a command file');
			logger.error(error.message); logger.debug(error.stack);
		}
		else {
			logger.error('Unknown error occured while loading the commands!');
			logger.error(error.message); logger.debug(error.stack);
		}
		logger.warn('Stopped loading directory \'slashcmds\'. Some commands may fail to respond.');
	};
	if (forceUpdateCmds) {
		logger.debug('Forcing application command updates!');
		const rest = new REST({ version: '9' }).setToken(discordToken);
		/*
    // Load commands into client as global commands.
    try {
      logger.debug(`Started loading global application (/) commands for ${client.user.tag}.`);
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands },
      );
      logger.debug(`Successfully loaded global application (/) commands for ${client.user.tag}.`);
      logger.info('Global slash commands update completed!');
      logger.warn('It may take up to an hour to sync changes across Discord.');
    } catch (error) {
      logger.error('Unable to refresh application (/) commands!')
      logger.error(`Discord API Error! Err. Code: ${error.code} Response: ${error.status} - ${error.message}`);
    };
    */
		// Load commands into guilds as guild commands.
		client.guilds.cache.forEach(async guild => {
			try {
				logger.debug(`Started loading guild application (/) commands for ${guild.name}.`);
				await rest.put(
					Routes.applicationGuildCommands(client.user.id, guild.id),
					{ body: commands },
				);
				logger.debug(`Successfully loaded guild application (/) commands for ${guild.name}.`);
				logger.info('Guild slash commands update completed!');
				logger.info('Guild slash commands are now available.');
			}
			catch (error) {
				logger.error('Unable to refresh guild application (/) commands!');
				logger.error(`Discord API Error! Err. Code: ${error.code} Response: ${error.status} - ${error.message}`);
				logger.debug(error.stack);
			}
		});
	}	else {
		// do nothing...
	};
};

module.exports = { loadBotCmds };