const logger = require('../plugins/winstonLogger');
const { credentials, deploy } = require('../handlers/bootLoader');
const { discordToken } = credentials;
const { clientId, guildId } = deploy;
const { readdirSync } = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = []; const botCmdsDir = './core/commands';

logger.info(`clientId: ${clientId}`); logger.info(`guildId: ${guildId}`);

try {
	readdirSync(botCmdsDir).forEach(subDir => {
		const dirPath = `${botCmdsDir}/${subDir}/`;
		const cmdfiles = readdirSync(dirPath).filter(file => file.endsWith('.js'));
		logger.data(JSON.stringify(cmdfiles));
		for (const file of cmdfiles) {
			logger.debug(`Parsing ${file} of ${subDir} in slashcmds`);
			logger.debug(`cmdfile -> ${file}`);
			const cmd = require(`../commands/${subDir}/${file}`);
			const cmdDataJSON = cmd.data.toJSON();
			if (!cmdDataJSON.name || cmdDataJSON.name.trim() === '') return logger.error(`Command ${file} missing name property or no name provided!`);
			if (!cmd.execute) return logger.error(`Command ${file} missing execute() function!`);
			commands.push(cmdDataJSON);
		}
	});
}
catch (error) {
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
}


const rest = new REST({ version: '9' }).setToken(discordToken);

(async () => {
	try {
		logger.info('Syncing new application (/) commands.');
		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		logger.info('Successfully synced application (/) commands!');
	}
	catch (error) {
		logger.error('Unable to refresh application (/) commands!');
		logger.error(`Discord API Error! Err. Code: ${error.code} Response: ${error.status} - ${error.message}`);
		logger.debug(error.stack);
	}
})();