const logger = require('../../utils/winstonLogger');
const { modLog } = require('../../plugins/guildLogger');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mod')
    .setDescription('Moderator commands.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('ban')
        .setDescription('Bans user from the server.')
        .addUserOption(option =>
          option
            .setName('target')
            .setDescription('User Mentionable or ID')
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
            .setName('limit')
            .setDescription('Days to remove history (default: 7)')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('kick')
        .setDescription('Kicks user from the server.')
        .addUserOption(option =>
          option
            .setName('target')
            .setDescription('User Mentionable or ID')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('reason')
            .setDescription('Reason? (optional)')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('mute')
        .setDescription('Mutes the user from chatting in channels.')
        .addUserOption(option =>
          option
            .setName('target')
            .setDescription('User Mentionable or ID')
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
            .setName('duration')
            .setDescription('Duration of mute')
            .setRequired(true)
            .addChoice('1 Hour', 3600000)
            .addChoice('2 Hours', 7200000)
            .addChoice('4 Hours', 14400000)
            .addChoice('8 Hours', 28800000)
            .addChoice('12 Hours', 43200000)
            .addChoice('1 Day', 86400000)
            .addChoice('1 Week', 604800000)
            .addChoice('1 Month', 2592000000)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('warn')
        .setDescription('Issue warning for user with reason.')
        .addUserOption(option =>
          option
            .setName('target')
            .setDescription('User Mentionable or ID')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('reason')
            .setDescription('Reason? (optional)')
            .setRequired(false)
        )
    ),
  async execute(interaction, client) {
    await interaction.deferReply();
    const options = interaction.options;
    const subcmd = options.getSubcommand();
    const executor = interaction.member;
    const target = options.getMember('target');
    const reason = options.getString('reason');
    const duration = options.getInteger('duration');
    const limit = options.getInteger('limit');
    const { roles } = await client.settings.guild.get(guild);
    if (executor.roles.cache.some(role => roles.staff.indexOf(role.id))) {
      if (!target) return interaction.editReply(
        { content: 'This user could not be found!', ephemeral: true };
      );
      let successResponse, errorResponse;
      const response = `Moderation action '${subcmd}' failed!`
      switch (subcmd) {
        case 'ban':
          try {
            await target.ban({ days: limit || 7, reason: reason || 'Banned by staff member.' });
            successResponse = {
              content: `Banned ${member.user.tag} successfully!`, ephemeral: true
            };
            modLog('ban', guild, { executor, member, reason }, client);
          } catch (err) {
            logger.debug(err);
            logger.debug(`Unable to ban ${target.user.tag}!`);
            errorResponse {
              content: `Unable to ban ${member.user.tag}!`, ephemeral: true
            };
          };
          break;
        case 'kick':
          try {
            await target.kick(reason || 'Kicked by staff member.');
            successResponse = {
              content: `Kicked ${member.user.tag} successfully!`, ephemeral: true
            };
            modLog('kick', guild, { executor, member, reason }, client);
          } catch (err) {
            logger.debug(err);
            logger.debug(`Unable to kick ${target.user.tag}!`);
            errorResponse {
              content: `Unable to ban ${member.user.tag}!`, ephemeral: true
            };
          };
          break;
        case 'mute':
          try {
            successResponse = {
              content: `Issued mute for ${member.user.tag} successfully!`, ephemeral: true
            };
            modLog('mute', guild, { executor, member, reason }, client);
          } catch (err) {
            logger.debug(err);
            logger.debug(`Unable to issue mute for ${target.user.tag}!`);
            errorResponse {
              content: `Failed to mute ${member.user.tag}!`, ephemeral: true
            };
          };
          break;
        case 'warn':
          try {
            successResponse = {
              content: `Issued warning for ${member.user.tag} successfully!`, ephemeral: true
            };
            modLog('warn', guild, { executor, member, reason }, client);
          } catch (err) {
            logger.debug(err);
            logger.debug(`Unable to issue warning for ${target.user.tag}!`);
            errorResponse {
              content: `Failed to issue warning for ${member.user.tag}!`, ephemeral: true
            };
          };
          break;
        default:
        // ..
      };
      await interaction.editReply(successResponse || errorResponse);
    } else {
      interaction.editReply({
        content: 'You do not have permission to run this command!', ephemeral: true
      });
    };
  },
};