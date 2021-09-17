const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../../plugins/winstonLogger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mutes mentioned user with optional reason.')
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
    const muteRole = guild.roles.cache.find(role => role.id === roles.mute);
    if (executor.id === member.user.id) return interaction.editReply({
      content: 'You cannot mute yourself!', ephemeral: true
    });
		if (executor.roles.cache.some(role => roles.staff.indexOf(role.id))) {
	    logger.debug(`Adding mute role to ${member.user.tag}`);
      try {
        member.roles.add(muteRole);
      } catch (error) {
        logger.error(`Failed to add mute role to ${member.user.tag}!`);
        logger.error(error.message); logger.debug(error.stack);
      };
		} else {
			interaction.reply({
				content: 'You are not a staff member or are missing the required roles to use this command here!', ephemeral: true
			});
		};
  }
};