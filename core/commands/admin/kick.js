const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../../plugins/winstonLogger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks mentioned user with optional reason.')
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
    ),
  async execute(interaction, client) {
		await interaction.deferReply({ ephemeral: true });
    const member = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason');
    const executor = interaction.user; const guild = interaction.guild;
    const settings = await client.settings.guild.get(guild); const { roles } = settings;
    if (executor.id === member.user.id) return interaction.editReply({
      content: 'You cannot ban yourself!', ephemeral: true
    });
		if (executor.roles.cache.some(role => roles.staff.indexOf(role.id))) {
	    logger.debug(`Preparing to kick user ${member.user.tag}`);
      try {
        member.kick({ reason: (reason) ? reason : 'Kicked by a  moderator.'});
      } catch (error) {
        logger.error(`Failed to kick ${member.user.tag}!`);
        logger.error(error.message); logger.debug(error.stack);
      };
		} else {
			interaction.reply({
				content: 'You are not a staff member or are missing the required roles to use this command here!', ephemeral: true
			});
		};
  }
};