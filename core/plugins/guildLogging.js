const logger = require('./winstonLogger');
const { format } = require('date-fns');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');

const logEmbed = new MessageEmbed()
  .setTitle('Moderation Action Logged!')
  .setFooter('Bot created and maintained by NovaLynxie.', client.user.displayAvatarURL({ format: 'png' }));

function guildLogger (action, member, reason, client) {
  reason = (reason) ? reason : 'No reason was provided.'

  if (action === 'ban') {
    logEmbed
      .setColor('#e8411c')
      .setDescription('🔨 The ban hammer has spoken.')
      .addFields(
        {
          name: 'Member Details',
          value: stripIndents`
            Username: ${member.user.tag} (${member.displayName})
            Created: ${format(member.user.createdAt, 'PPPPpppp')}`
        },
        {
          name: 'Reason for Ban',
          value: reason
        }
      )
  } else
  if (action === 'kick') {
    logEmbed
      .setColor('#e8411c')
      .setDescription('👢 A magical boot gives them a swift kick.')
      .addFields(
        {
          name: 'Member Details',
          value: stripIndents`
            Username: ${member.user.tag} (${member.displayName})
            Created: ${format(member.user.createdAt, 'PPPPpppp')}
            Joined: ${format(member.joinedAt, 'PPPPpppp')}`
        },
        {
          name: 'Reason for Kick',
          value: reason
        }
      )
  } else 
  if (action === 'mute') {
    logEmbed
      .setColor('#e8a11c')
      .setDescription('🤐 Silence you fool!')
      .addFields(
        {
          name: 'Member Details',
          value: stripIndents`
            Username: ${member.user.tag} (${member.displayName})
            Created: ${format(member.user.createdAt, 'PPPPpppp')}
            Joined: ${format(member.joinedAt, 'PPPPpppp')}`
        },
        {
          name: 'Reason for Mute',
          value: reason
        }
      )
  } else 
  if (action === 'warn') {
    logEmbed
      .setColor('#e8bc1c')
      .setDescription('⚠️ Issued a warning this time.')
      .addFields(
        {
          name: 'Member Details',
          value: stripIndents`
            Username: ${member.user.tag} (${member.displayName})
            Created: ${format(member.user.createdAt, 'PPPPpppp')}
            Joined: ${format(member.joinedAt, 'PPPPpppp')}`
        },
        {
          name: 'Reason for Warning',
          value: reason
        }
      )
  };
  try {
    // to be implemented.
    logger.debug('Sending moderation log to channel now...');
    //client.channels.cache.get('CHANNEL ID').send('Hello here!');
    logger.debug('Moderation log sent successfully!');
  } catch (err) {
    logger.error('Failed to save moderation log embed!');
    logger.error(err.message); logger.debug(err.stack);
  }
  
};

module.exports = { guildLogger };