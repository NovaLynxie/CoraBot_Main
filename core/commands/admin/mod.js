const logger = require('../../utils/winstonLogger');
const { modLog } = require('../../plugins/guildLogger');
const { Permissions } = require('discord.js');
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
        .addIntegerOption(option =>
          option
            .setName('duration')
            .setDescription('Duration of mute (Default: 1 Minute)')
            .setRequired(false)
            .addChoice('1 Minute', 60000)
            .addChoice('5 Minutes', 300000)
            .addChoice('10 Minutes', 600000)
            .addChoice('15 Minutes', 900000)
            .addChoice('30 Minutes', 1800000)
            .addChoice('45 Minutes', 2700000)
            .addChoice('1 Hour', 3600000)
            .addChoice('2 Hours', 7200000)
            .addChoice('4 Hours', 14400000)
            .addChoice('8 Hours', 28800000)
            .addChoice('12 Hours', 43200000)
            .addChoice('1 Day', 86400000)
            .addChoice('1 Week', 604800000)
            .addChoice('1 Month', 2592000000)
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
    await interaction.deferReply({ ephemeral: true });
    const guild = interaction.guild;
    const options = interaction.options;
    const subcmd = options.getSubcommand();
    const executor = interaction.member;
    const target = options.getMember('target');
    const reason = options.getString('reason');
    const duration = options.getInteger('duration') || 60000;
    const limit = options.getInteger('limit');
    const { roles } = await client.settings.guild.get(guild);
    if (!executor.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return interaction.reply({ content: 'You do not have the required permissions to use this command!'});
    if (!guild.me.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return interaction.reply({ content: 'Unable to ban member! Missing permission `BAN_MEMBERS`!'});
    if (executor.roles.cache.some(role => roles.staff.indexOf(role.id))) {
      if (!target) return interaction.editReply({
        content: 'This user could not be found!', ephemeral: true
      });
      let successResponse, errorResponse;
      const response = `Moderation action '${subcmd}' failed!`
      switch (subcmd) {
        case 'ban':
          try {
            await target.ban({ days: limit || 7, reason: reason || 'Banned by staff member.' });
            successResponse = {
              content: `Banned ${target.user.tag} successfully!`, ephemeral: true
            };
            modLog('ban', guild, { executor, target, reason }, client);
          } catch (err) {
            logger.debug(err);
            logger.debug(`Unable to ban ${target.user.tag}!`);
            errorResponse = {
              content: `Unable to ban ${target.user.tag}!`, ephemeral: true
            };
          };
          break;
        case 'kick':
          try {
            await target.kick(reason || 'Kicked by staff member.');
            successResponse = {
              content: `Kicked ${target.user.tag} successfully!`, ephemeral: true
            };
            modLog('kick', guild, { executor, target, reason }, client);
          } catch (err) {
            logger.debug(err);
            logger.debug(`Unable to kick ${target.user.tag}!`);
            errorResponse = {
              content: `Unable to ban ${target.user.tag}!`, ephemeral: true
            };
          };
          break;
        case 'mute':
          try {
            target.roles.add(muteRole);
            successResponse = {
              content: `Issued mute for ${target.user.tag} successfully!`, ephemeral: true
            };
            modLog('mute', guild, { executor, target, reason }, client);
          } catch (err) {
            logger.debug(err);
            logger.debug(`Unable to issue mute for ${target.user.tag}!`);
            errorResponse = {
              content: `Failed to mute ${target.user.tag}!`, ephemeral: true
            };
          };
          break;
        case 'warn':
          try {
            successResponse = {
              content: `Issued warning for ${target.user.tag} successfully!`, ephemeral: true
            };
            modLog('warn', guild, { executor, target, reason }, client);
          } catch (err) {
            logger.debug(err);
            logger.debug(`Unable to issue warning for ${target.user.tag}!`);
            errorResponse = {
              content: `Failed to issue warning for ${target.user.tag}!`, ephemeral: true
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