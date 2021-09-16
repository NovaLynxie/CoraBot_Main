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
				.setDescription('Reason? (optional)')
				.setRequired(false),
		),
	async execute(interaction, client) {
		await interaction.deferReply({ ephemeral: true });
		// const user = interaction.options.getUser('target');
    const member = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason');
		const executor = interaction.user; const guild = interaction.guild;
		const settings = await client.settings.guild.get(guild); const { roles } = settings;
		if (executor.roles.cache.some(role => roles.staff.indexOf(role.id))) {
      logger.debug(`Preparing to ban user ${user.tag}`);
      try {
        member.ban({ reason: (reason) ? reason : 'Banned by a  moderator.'});
        // guild.members.ban(user);
      } catch (error) {
        logger.error(`Failed to ban ${user.tag}!`);
        logger.error(error.message); logger.debug(error.stack);
      };
		} else {
			interaction.reply({
				content: 'You do not have permission to ban this member!',
				ephemeral: true,
			});
		};
	}
};