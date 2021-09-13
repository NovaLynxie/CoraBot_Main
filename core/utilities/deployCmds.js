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
			// Require command file here.
			const cmd = require(`../commands/slashcmds/${subDir}/${file}`);
			const cmdDataJSON = cmd.data.toJSON();
			// Error checking if command has no syntax errors thrown when requiring the file.
			// If no name or empty field, don't load the commmand.
			if (!cmdDataJSON.name || cmdDataJSON.name.trim() === '') return logger.error(`Command ${file} missing name property or no name provided!`);
			// If no category, warn that help command cannot show information for it.
			// if (!cmdDataJSON.category) logger.warn(`Command ${file} missing category! Help command will not show this command.`); // no category available... (-_-)
			// If no execute function, do not load command as this will do nothing without it.
			if (!cmd.execute) return logger.error(`Command ${file} missing execute() function!`);
			// If all goes well, push cmdDataJSON into the commands array for updating application commands later.
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