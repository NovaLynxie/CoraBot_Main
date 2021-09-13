const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with \'Pong\' and response time.'),
	async execute(interaction, client) {
		await interaction.reply(
			{
				content: `Pong! :heartpulse: ${client.ws.ping}ms`,
				ephemeral: true,
			},
		);
	},
};