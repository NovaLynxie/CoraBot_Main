const logger = require('../../utils/winstonLogger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Generates a new invite'),
  async execute(interaction, client) {
    logger.debug('Generating application invite link...');
    let inviteLink, inviteEmbed;
    try {
      inviteLink = client.generateInvite({
        permissions: [
          FLAGS.CREATE_INSTANT_INVITE, FLAGS.KICK_MEMBERS, FLAGS.BAN_MEMBERS, FLAGS.MANAGE_CHANNELS, FLAGS.MANAGE_GUILD, FLAGS.ADD_REACTIONS, FLAGS.PRIORITY_SPEAKER, FLAGS.VIEW_CHANNEL, FLAGS.SEND_MESSAGES, FLAGS.SEND_TTS_MESSAGES, FLAGS.MANAGE_MESSAGES, FLAGS.EMBED_LINKS, FLAGS.ATTACH_FILES, FLAGS.READ_MESSAGE_HISTORY, FLAGS.MENTION_EVERYONE, FLAGS.USE_EXTERNAL_EMOJIS, FLAGS.CONNECT, FLAGS.SPEAK, FLAGS.CHANGE_NICKNAME, FLAGS.MANAGE_NICKNAMES, FLAGS.MANAGE_ROLES, FLAGS.USE_APPLICATION_COMMANDS, FLAGS.MANAGE_THREADS, FLAGS.CREATE_PUBLIC_THREADS, FLAGS.CREATE_PRIVATE_THREADS, FLAGS.USE_EXTERNAL_STICKERS, FLAGS.SEND_MESSAGES_IN_THREADS, FLAGS.MODERATE_MEMBERS
        ],
        scopes: ['applications.commands', 'bot']
      });      
      logger.debug(`inviteLink => ${inviteLink}`);
    } catch (error) {
      logger.error('AppInvite Generation Error!');
      logger.error(error.message); logger.debug(error.stack);
      throw error;
    };
    inviteEmbed = new MessageEmbed()
      .setTitle('Application Invitation System').setColor('#3ee6ae')
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setDescription(`
      Thank you for choosing to use CoraBot.
      Please click the link below to start adding the bot to your server.
      ⚙️ [Invite Me!](${inviteLink})`)
      .setFooter({
        text: 'Bot created and maintained by NovaLynxie.', iconURL: client.user.displayAvatarURL({ format: 'png' })
      });
    return interaction.reply(
      {
        embeds: [inviteEmbed],
        ephemeral: true,
      }
    );
  },
};