const { SlashCommandBuilder } = require('@discordjs/builders');
const { stripIndents } = require('common-tags');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with \'Pong\' and response time.'),
	async execute(interaction, client) {
    let latency = new Date().getTime() - interaction.createdTimestamp;
    await interaction.reply(
			{
				content: stripIndents`Ping Responder
          \`\`\`
          📡 ${client.ws.ping} ms
          💬 ${latency} ms
          \`\`\``,
				ephemeral: true,
			}
		);
	},
};