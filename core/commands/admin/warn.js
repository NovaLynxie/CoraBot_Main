const logger = require('../../plugins/winstonLogger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { guildLogger } = require('../../plugins/guildLogging');

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
    const member = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason');
    const executor = interaction.member; const guild = interaction.guild;
    const settings = await client.settings.guild.get(guild); const { roles } = settings;
    if (executor.id === member.user.id) return interaction.editReply({
      content: 'You cannot warn yourself!', ephemeral: true
    });
		if (executor.roles.cache.some(role => roles.staff.indexOf(role.id))) {
	    guildLogger('warn', { executor, member, reason }, client);
      interaction.editReply({
        content: `Issued warning for ${member.user.tag} successfully!`, ephemeral: true
      });
		} else {
			interaction.editReply({
        content: 'You do not have permissions to run this command!', ephemeral: true
      });
		};
  }
};