const logger = require('./winstonLogger');
const { format } = require('date-fns');
const { MessageEmbed } = require('discord.js');
const { time } = require('@discordjs/builders');
const { stripIndents } = require('common-tags');
async function guildLogger (action, params = {}, client) {
  let executor = params?.executor, member = params?.member;
  let reason = (params?.reason) ? params.reason : 'No reason provided.';
  let messages = (params?.messages) ? params.messages : 'No message data.';
  let guild = member.guild, logdate = new Date();
  let settings = await client.settings.guild.get(guild);
  let { logChannels } = settings;
  const guildLogEmbed = new MessageEmbed()
    .setTitle('Moderation Action Logged!')
    .setFooter('Bot created and maintained by NovaLynxie.', client.user.displayAvatarURL({ format: 'png' }));  
  let modLogFields = [
    {
      name: 'Member Details',
      value: stripIndents`
        Username: ${member.user.tag} (${member.displayName})
        Created: ${format(member.user.createdAt, 'PPPPpppp')}
        Joined: ${format(member.joinedAt, 'PPPPpppp')}`
    },
    {
      name: 'Moderator Details',
      value: stripIndents`
        Executor: ${executor.user.tag} (${executor.displayName})`
    },
    {
      name: 'Action Details',
      value: stripIndents`
        Log Date: ${format(logdate, 'PPPPpppp')}
        __**Reason**__
        ${reason}`
    }
  ];
  if (action === 'ban') {
    guildLogEmbed
      .setColor('#e8411c')
      .setDescription('🔨 The ban hammer has spoken.')
      .addFields(modLogFields)
  } else
  if (action === 'kick') {
    guildLogEmbed
      .setColor('#e8411c')
      .setDescription('👢 A magical boot gives them a swift kick.')
      .addFields(modLogFields)
  } else 
  if (action === 'mute') {
    guildLogEmbed
      .setColor('#e8a11c')
      .setDescription('🤐 Silence you fool!')
      .addFields(modLogFields)
  } else 
  if (action === 'warn') {
    guildLogEmbed
      .setColor('#e8bc1c')
      .setDescription('⚠️ Issued a warning this time.')
      .addFields(modLogFields)
  } else 
  if (action === 'clear') {
    guildLogEmbed
      .setColor('#4bdb23')
      .setDescription('🧹 Sweeping away old messages.')
      .addFields(
        {
          name: 'Message Cleaner Results',
          value: stripIndents`
            Removed ${messages.size}`
        }
      )
  };
  try {
    logger.debug('Sending moderation log to channel now...');
    let modLogChannel = guild.channels.cache.get(logChannels.modLogChID);
    modLogChannel.send({ embeds: [guildLogEmbed] });
    logger.debug('Moderation log sent successfully!');
  } catch (err) {
    logger.error('Failed to save moderation log embed!');
    logger.error(err.message); logger.debug(err.stack);
  };
};
module.exports = { guildLogger };