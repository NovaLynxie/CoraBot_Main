const logger = require('../../plugins/winstonLogger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const { guildLogger } = require('../../plugins/guildLogging');

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
    const member = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason');
    const executor = interaction.member; const guild = interaction.guild;
    const settings = await client.settings.guild.get(guild); const { roles } = settings;
    if (!executor.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) return interaction.reply({ content: 'You do not have the required permissions to use this command!'});
    if (!client.guild.me.permissions.has(Permissions.FLAGS.KICK_MEMBERS)) return interaction.reply({ content: 'Unable to ban member! Missing permission `BAN_MEMBERS`!'});
    if (executor.id === member.user.id) return interaction.editReply({
      content: 'You cannot kick yourself!', ephemeral: true
    });
    if (executor.roles.cache.some(role => roles.staff.indexOf(role.id))) {
	    logger.debug(`Preparing to kick user ${member.user.tag}`);
      try {
        member.kick({ reason: (reason) ? reason : 'Kicked by a  moderator.'});
        guildLogger('kick', member, reason, client);
        interaction.editReply({
          content: `Kicked ${member.user.tag} successfully from the server!`, ephemeral: true
        });
      } catch (error) {
        logger.error(`Failed to kick ${member.user.tag}!`);
        logger.error(error.message); logger.debug(error.stack);
        interaction.editReply({
          content: `Failed to kick ${member.user.tag}!`, ephemeral: true
        });
      };
		} else {
			interaction.editReply({
				content: 'You are not a staff member or are missing the required roles to use this command here!', ephemeral: true
			});
		};
  }
};