const logger = require('../../plugins/winstonLogger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { guildLogger } = require('../../plugins/guildLogging');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Issues a warning mentioned user with optional reason.')
    .addIntegerOption(option => 
      option
        .setName('limit')
        .setDescription('Number of messages to delete?')
        .setRequired(true)
    ),
  async execute(interaction, client) {
		await interaction.deferReply({ ephemeral: true });
    const limit = interaction.options.getInteger('limit');
    const executor = interaction.member; const guild = interaction.guild;
    const settings = await client.settings.guild.get(guild); const { roles } = settings;
    if (executor.id === member.user.id) return interaction.editReply({
      content: 'You cannot warn yourself!', ephemeral: true
    });
		if (executor.roles.cache.some(role => roles.staff.indexOf(role.id))) {
	    guildLogger('clear', { executor }, client);
      interaction.editReply({
        content: `Issued warning for ${member.user.tag} successfully!`, ephemeral: true
      });
		} else {
			interaction.editReply({
				content: 'You are not a staff member or are missing the required roles to use this command here!', ephemeral: true
			});
		};
  }
};