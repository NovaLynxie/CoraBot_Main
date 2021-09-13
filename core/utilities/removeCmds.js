const logger = require('../plugins/winstonLogger');
const { credentials, deploy } = require('../handlers/bootLoader');
const { discordToken } = credentials;
const { clientId, guildId } = deploy;
const { readdirSync } = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const commands = [];

logger.info(`clientId: ${clientId}`); logger.info(`guildId: ${guildId}`);

const rest = new REST({ version: '9' }).setToken(discordToken);

(async () => {
	try {
		logger.info('Removing existing application (/) commands.');
		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		logger.info('Successfully removed application (/) commands!');
	}
	catch (error) {
		logger.error('Unable to refresh application (/) commands!');
		logger.error(`Discord API Error! Err. Code: ${error.code} Response: ${error.status} - ${error.message}`);
		logger.debug(error.stack);
	}
})();