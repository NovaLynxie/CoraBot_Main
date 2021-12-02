const logger = require('../../utils/winstonLogger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const { modLog } = require('../../plugins/guildLogger');

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
        .setDescription('Days? (defaults to 7 days)')
        .setRequired(false)
    ),
	async execute(interaction, client) {
		await interaction.deferReply({ ephemeral: true });
    const days = interaction.options.getInteger('days');
    const member = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason');
		const executor = interaction.member; const guild = interaction.guild;
		const settings = await client.settings.guild.get(guild); const { roles } = settings;
    if (!executor.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return interaction.reply({ content: 'You do not have the required permissions to use this command!'});
    if (!client.guild.me.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return interaction.reply({ content: 'Unable to ban member! Missing permission `BAN_MEMBERS`!'});
    if (executor.id === member.user.id) return interaction.editReply({
      content: 'You cannot kick yourself!', ephemeral: true
    });
    if (executor.roles.cache.some(role => roles.staff.indexOf(role.id))) {
      logger.debug(`Preparing to ban user ${user.tag}`);
      try {
        member.ban({ days: (days) ? days : 7, reason: (reason) ? reason : 'Banned by a  moderator.'});
        
        modLog('ban', guild, { executor, member, reason }, client);
        interaction.editReply({
          content: `Banned ${member.user.tag} successfully from the server!`, ephemeral: true
        });
      } catch (error) {
        logger.error(`Failed to ban ${user.tag}!`);
        logger.error(error.message); logger.debug(error.stack);
        interaction.editReply({
          content: `Failed to ban ${member.user.tag}!`, ephemeral: true
        });
      };
		} else {
			interaction.editReply({
        content: 'You do not have permissions to run this command!', ephemeral: true
      });
		};
	}
};