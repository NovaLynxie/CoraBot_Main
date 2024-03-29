const logger = require('../../utils/winstonLogger');
const uuid = require('uuid');
const addMinutes = require('date-fns/addMinutes');
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
        .setDescription('Mutes the user from interacting in channels.')
        .addUserOption(option =>
          option
            .setName('target')
            .setDescription('User Mentionable or ID')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('duration')
            .setDescription('How long to mute for?')
            .setRequired(true)
            .addChoice('60 secs', 1)
            .addChoice('5 mins', 5)
            .addChoice('10 mins', 10)
            .addChoice('1 hour', 60)
            .addChoice('1 day', 1440)
            .addChoice('1 week', 10080)
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
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('unban')
        .setDescription('Pardon ban for specified user (snowflakeID).')
        .addUserOption(option =>
          option
            .setName('target')
            .setDescription('User\'s Snowflake ID')
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
        .setName('unmute')
        .setDescription('Pardon mute for specified user.')
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
    const target = options.getMember('target') || options.getUser('target');
    const reason = options.getString('reason');
    const duration = options.getInteger('duration');
    const limit = options.getInteger('limit');
    const { roles } = await client.settings.guild.get(guild);
    if (!executor.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return interaction.reply({ content: 'You do not have the required permissions to use this command!' });
    if (!guild.me.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return interaction.reply({ content: 'Unable to ban member! Missing permission `BAN_MEMBERS`!' });
    if (executor.roles.cache.some(role => roles.staff.indexOf(role.id))) {
      if (!target) return interaction.editReply({
        content: 'This user could not be found!', ephemeral: true
      });
      let successResponse, errorResponse, recordId = uuid.v1().substr(0,8);
      const modData = await client.data.guild.moderation.get(guild);
      const response = `Moderation action '${subcmd}' failed!`
      if (!modData.users[target.id]) {
        modData.users[target.id] = {
          bans: {}, kicks: {}, mutes: {}, warns: {}
        };
      };
      switch (subcmd) {
        case 'ban':
          modData.users[target.id].bans[recordId] = {
            staffId: executor.id, guildId: guild.id, reason: reason || 'None provided', issuedAt: new Date()
          };
          try {
            let banOptions = { days: limit || 7, reason: reason || 'Banned by staff member.' };
            if (target.ban) {
              await target.ban(banOptions);
            } else {
              await guild.members.ban(target.id , banOptions);
            };            
            successResponse = {
              content: `Banned ${target} successfully!`, ephemeral: true
            };
            modLog('ban', guild, { executor, member: target, reason, recordId }, client);
          } catch (err) {
            logger.debug(err);
            logger.debug(`Unable to ban ${target.user.tag}!`);
            errorResponse = {
              content: `Unable to ban ${target}!`, ephemeral: true
            };
          };
          break;
        case 'unban':
          try {
            await guild.members.unban(target);
            successResponse = {
              content: `Removed ban for ${target} successfully!`, ephemeral: true
            };
            modLog('pardon', guild, { executor, member: target, reason }, client);
          } catch (err) {
            logger.debug(err);
            logger.debug(`Unable to remove ban for ${target.user.tag}!`);
            errorResponse = {
              content: `Unable to remove ban for ${target}!`, ephemeral: true
            };
          };
          break;
        case 'kick':
          modData.users[target.id].kicks[recordId] = {
            staffId: executor.id, guildId: guild.id, reason: reason || 'None provided', issuedAt: new Date()
          };
          try {
            await target.kick(reason || 'Kicked by staff member.');
            successResponse = {
              content: `Kicked ${target.user.tag} successfully!`, ephemeral: true
            };
            modLog('kick', guild, { executor, member: target, reason, recordId }, client);
          } catch (err) {
            logger.debug(err);
            logger.debug(`Unable to kick ${target.user.tag}!`);
            errorResponse = {
              content: `Unable to ban ${target}!`, ephemeral: true
            };
          };
          break;
        case 'mute':
          modData.users[target.id].mutes[recordId] = {
            staffId: executor.id, guildId: guild.id, reason: reason || 'None provided', issuedAt: new Date()
          };
          try {
            await target.timeout(duration * 60 * 1000, reason || 'Muted by staff member.');
            successResponse = {
              content: `Issued mute for ${target} successfully!`, ephemeral: true
            };
            modLog('mute', guild, { executor, member: target, reason, recordId }, client);
          } catch (err) {
            logger.debug(err);
            logger.debug(`Unable to issue mute for ${target.user.tag}!`);
            errorResponse = {
              content: `Failed to mute ${target}!`, ephemeral: true
            };
          };
          break;
        case 'unmute':
          try {
            await target.timeout(null, reason || 'Unmuted by staff member.');
            successResponse = {
              content: `Removed mute from ${target} successfully!`, ephemeral: true
            };
            modLog('unmute', guild, { executor, member: target, reason }, client);
          } catch (err) {
            logger.debug(err);
            logger.debug(`Unable to issue mute for ${target.user.tag}!`);
            errorResponse = {
              content: `Failed to mute ${target}!`, ephemeral: true
            };
          };
          break;
        case 'warn':
          modData.users[target.id].warns[recordId] = {
            staffId: executor.id, guildId: guild.id, reason: reason || 'None provided', issuedAt: new Date()
          };
          try {
            modLog('warn', guild, { executor, member: target, reason, recordId }, client);
            successResponse = {
              content: `Issued warning for ${target} successfully!`, ephemeral: true
            };
          } catch (err) {
            logger.debug(err);
            logger.debug(`Unable to issue warning for ${target.user.tag}!`);
            errorResponse = {
              content: `Failed to issue warning for ${target}!`, ephemeral: true
            };
          };
          break;
      };
      await interaction.editReply(successResponse || errorResponse);
      await client.data.guild.moderation.set(guild, modData);
    } else {
      interaction.editReply({
        content: 'You do not have permission to run this command!', ephemeral: true
      });
    };
  },
};