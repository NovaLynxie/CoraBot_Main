const logger = require('./winstonLogger');
const { format } = require('date-fns');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');

async function guildLogger (action, params = {}, client) {
  let guild = member.guild;
  let settings = await client.settings.guild.get(guild);
  let { logChannels } = settings;
  let placeholderMember = {
    "displayName": "Unknown",
    "user": {
      "id": "12345678912345678", 
      "username": "Unknown",
      "discriminator": "0000",
      "avatar": undefined,
      "verified": false,
      "email": "placeholder@example.com",
      "flags": 64,
      "banner": null,
      "accent_color": 16711680,
      "premium_type": 0,
      "public_flags": 64
    },
    "nick": "Unknown User",
    "roles": [],
    "joined_at": "2015-04-26T06:26:56.936000+00:00",
    "deaf": false,
    "mute": false
  };
  function placeholderUserTag () {
    return res = `${placeholderUser.user.username}${placeholderUser.user.discriminator}`;
  };

  let messages = (params?.messages) ? params.messages : 'No message data.';
  let executor = params?.executor, member = params?.member;
  let reason = (params?.reason) ? params.reason : 'No reason provided.';

  const guildLogEmbed = new MessageEmbed()
    .setTitle('Moderation Action Logged!')
    .setFooter('Bot created and maintained by NovaLynxie.', client.user.displayAvatarURL({ format: 'png' }));
  
  function fetchMemberDetails() {
    let res;
    if (member) {
      res = stripIndents`
        Username: ${member.user.tag} (${member.displayName})
        Created: ${format(member.user.createdAt, 'PPPPpppp')}
        Joined: ${format(member.joinedAt, 'PPPPpppp')}`;
    } else {
      res = 'No Member Details available!';
    };
    return res;
  };

  if (action === 'ban') {
    guildLogEmbed
      .setColor('#e8411c')
      .setDescription('🔨 The ban hammer has spoken.')
      .addFields(
        {
          name: 'Member Details',
          value: fetchMemberDetails()
        },
        {
          name: 'Reason for Ban',
          value: reason
        }
      )
  } else
  if (action === 'kick') {
    guildLogEmbed
      .setColor('#e8411c')
      .setDescription('👢 A magical boot gives them a swift kick.')
      .addFields(
        {
          name: 'Member Details',
          value: fetchMemberDetails()
        },
        {
          name: 'Reason for Kick',
          value: reason
        }
      )
  } else 
  if (action === 'mute') {
    guildLogEmbed
      .setColor('#e8a11c')
      .setDescription('🤐 Silence you fool!')
      .addFields(
        {
          name: 'Member Details',
          value: fetchMemberDetails()
        },
        {
          name: 'Reason for Mute',
          value: reason
        }
      )
  } else 
  if (action === 'warn') {
    guildLogEmbed
      .setColor('#e8bc1c')
      .setDescription('⚠️ Issued a warning this time.')
      .addFields(
        {
          name: 'Member Details',
          value: fetchMemberDetails()
        },
        {
          name: 'Reason for Warning',
          value: reason
        }
      )
  } else 
  if (action === 'clear') {
    guildLogEmbed
      .setColor('#4bdb23')
      .setDescription('🧹 Sweeping away old messages.')
      .addFields(
        {
          name: 'Message Contents',
          value: ''
        },
        {
          name: 'Channel Details',
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