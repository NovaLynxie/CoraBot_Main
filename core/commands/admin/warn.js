const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../../plugins/winstonLogger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Issues a warning mentioned user with optional reason.')
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
    const executor = interaction.user; const guild = interaction.guild;
    const settings = await client.settings.guild.get(guild); const { roles } = settings;
    if (executor.id === member.user.id) return interaction.editReply({
      content: 'You cannot warn yourself!', ephemeral: true
    });
		if (executor.roles.cache.some(role => roles.staff.indexOf(role.id))) {
	    // ...
		} else {
			interaction.reply({
				content: 'You are not a staff member or are missing the required roles to use this command here!', ephemeral: true
			});
		};
  }
};