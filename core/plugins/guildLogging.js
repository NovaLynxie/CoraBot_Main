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
            Created: ${format(member.user.createdAt, 'PPPPpppp')}`
        }
      )
  } else 
  if (action === 'mute') {
    // .. to be implemented
  } else 
  if (action === 'warn') {
    // .. to be implemented
  }

  //client.channels.cache.get('CHANNEL ID').send('Hello here!');
};

module.exports = { guildLogger };