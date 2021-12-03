const logger = require('../../utils/winstonLogger'); 
const addDuration = require('date-fns/add')
const { modLog } = require('../../plugins/guildLogger');
const { getDuration } = require('../../utils/botUtils');
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
        .addStringOption(option =>
          option
            .setName('duration')
            .setDescription('Mute duration [format: 1d 1h 1m]')
            .setRequired(false)
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
    const duration = getDuration(options.getString('duration')) || { minutes: 1 };
    const limit = options.getInteger('limit');
    const { roles } = await client.settings.guild.get(guild);
    if (!executor.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return interaction.reply({ content: 'You do not have the required permissions to use this command!' });
    if (!guild.me.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return interaction.reply({ content: 'Unable to ban member! Missing permission `BAN_MEMBERS`!' });
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
              content: `Banned ${target} successfully!`, ephemeral: true
            };
            modLog('ban', guild, { executor, member: target, reason }, client);
          } catch (err) {
            logger.debug(err);
            logger.debug(`Unable to ban ${target.user.tag}!`);
            errorResponse = {
              content: `Unable to ban ${target}!`, ephemeral: true
            };
          };
          break;
        case 'kick':
          try {
            await target.kick(reason || 'Kicked by staff member.');
            successResponse = {
              content: `Kicked ${target.user.tag} successfully!`, ephemeral: true
            };
            modLog('kick', guild, { executor, member: target, reason }, client);
          } catch (err) {
            logger.debug(err);
            logger.debug(`Unable to kick ${target.user.tag}!`);
            errorResponse = {
              content: `Unable to ban ${target}!`, ephemeral: true
            };
          };
          break;
        case 'mute':
          try {
            target.roles.add(muteRole);
            const endDate = addDuration(new Date, duration);
            //await client.data.mod.get()
            successResponse = {
              content: `Issued mute for ${target} successfully!`, ephemeral: true
            };
            modLog('mute', guild, { executor, member: target, reason }, client);
          } catch (err) {
            logger.debug(err);
            logger.debug(`Unable to issue mute for ${target.user.tag}!`);
            errorResponse = {
              content: `Failed to mute ${target}!`, ephemeral: true
            };
          };
          break;
        case 'warn':
          try {
            successResponse = {
              content: `Issued warning for ${target} successfully!`, ephemeral: true
            };
            modLog('warn', guild, { executor, member: target, reason }, client);
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
    } else {
      interaction.editReply({
        content: 'You do not have permission to run this command!', ephemeral: true
      });
    };
  },
};