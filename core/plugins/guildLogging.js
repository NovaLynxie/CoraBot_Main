const logger = require('./winstonLogger');
const { format } = require('date-fns');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');

const logEmbed = new MessageEmbed()
  .setTitle('Moderation Action Logged!')
  .setColor('#e8901c') .setColor('#e8411c')
  .setFooter('Bot created and maintained by NovaLynxie.', client.user.displayAvatarURL({ format: 'png' }));

function guildLogger (action, member, reason, client) {
  reason = (reason) ? reason : 'No reason was provided.'

  if (action = 'ban') {
    logEmbed
      .setColor('#e8411c')
      .setDescription('The ban hammer has spoken.')
      .addFields(
        {
          name: 'Member Details',
          value: stripIndents`
            Username: ${member.user.tag} (${member.displayName})
            Created: ${moment(member.user.createdAt).format('d[ days], h[ hours]: m[ minutes ]: s[ seconds]')}
            ${format(member.user.createdAt, 'PPPPpppp')}`
        }
      )
  }

  //client.channels.cache.get('CHANNEL ID').send('Hello here!');
};

module.exports = { guildLogger };