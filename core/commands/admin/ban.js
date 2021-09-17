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
				.setRequired(true)
		)
		.addStringOption(option =>
			option
				.setName('reason')
				.setDescription('Reason? (optional)')
				.setRequired(false)
		)
    .addIntegerOption(option => 
      option
        .setName('days')
        .setDescription('Days? (optional)')
        .setRequired(false)
    ),
	async execute(interaction, client) {
		await interaction.deferReply({ ephemeral: true });
    const days = interaction.options.getInteger('days');
    const member = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason');
		const executor = interaction.user; const guild = interaction.guild;
		const settings = await client.settings.guild.get(guild); const { roles } = settings;
    if (executor.id === member.user.id) return interaction.editReply({
      content: 'You cannot ban yourself!', ephemeral: true
    });
    if (!executor.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return interaction.reply({ content: 'You do not have the required permissions to use this command!'});
    if (!client.guild.me.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return interaction.reply({ content: 'Unable to ban member! Missing permission `BAN_MEMBERS`!'});
		if (executor.roles.cache.some(role => roles.staff.indexOf(role.id))) {
      logger.debug(`Preparing to ban user ${user.tag}`);
      try {
        member.ban({ days: (days) ? days : 7, reason: (reason) ? reason : 'Banned by a  moderator.'});
      } catch (error) {
        logger.error(`Failed to ban ${user.tag}!`);
        logger.error(error.message); logger.debug(error.stack);
      };
		} else {
			interaction.editReply({
				content: 'You are not a staff member or are missing the required roles to use this command here!', ephemeral: true
			});
		};
	}
};