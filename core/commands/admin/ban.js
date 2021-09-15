const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../../plugins/winstonLogger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Bans mentioned user with optional reason.')
		.addUserOption(option =>
			option
				.setName('target')
				.setDescription('Select a user')
				.setRequired(true),
		)
		.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('Reason for ban?')
				.setRequired(false),
		),
	async execute(interaction, client) {
		await interaction.deferReply({ ephemeral: true });
		const member = interaction.options.getUser('target');
		const user = interaction.user; const guild = interaction.guild;
		const settings = await client.settings.guild.get(guild); const { staff } = settings;
		if (member.roles.cache.some(role => staff.roles.indexOf(role.id))) {
	    // ...
		}
		else {
			interaction.reply({
				content: 'You do not have permission to ban this member!',
				ephemeral: true,
			});
		}
	},
};