const logger = require('../utils/winstonLogger');
const { config } = require('../handlers/bootLoader');
const { debug } = config;

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (debug) logger.data(JSON.stringify(interaction, null, 2));
		const client = interaction.client;
		if (interaction.isCommand()) {
			logger.debug(`${interaction.user.tag} in #${interaction.channel.name} from ${interaction.guild.name} triggered interaction '${interaction.commandName}'`);
			if (!client.commands.has(interaction.commandName)) return;
			try {
				await client.commands.get(interaction.commandName).execute(interaction, client);
			} catch (error) {
				logger.error(error.message); logger.debug(error.stack);
				await interaction.editReply({ content: `There was an error while executing command \`${interaction.commandName}\`!`, ephemeral: true });
			};
		}	else
		if (interaction.isButton()) {
			logger.debug(`${interaction.user.tag} in #${interaction.channel.name} from ${interaction.guild.name} triggered componentType=${interaction.componentType} -> id=${interaction.customId}`);
		} else
		if (interaction.isSelectMenu()) {
			logger.debug(`${interaction.user.tag} in #${interaction.channel.name} from ${interaction.guild.name} triggered componentType=${interaction.componentType} -> id=${interaction.customId}`);
		} else {
			logger.debug('Invalid or malformed interaction called!');
		};
	},
};