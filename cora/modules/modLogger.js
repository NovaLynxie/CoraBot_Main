const { MessageEmbed } = require('discord.js');
const logger = require('../providers/WinstonPlugin');
const { stripIndents } = require('common-tags');

module.exports = function modLogger(action, message, user, reason, client) {
  // Fetch settings from client settings provider.
  let modLoggerSettings = client.settings.get('modlogger');
  let { enableLogger, logChannels } = modLoggerSettings;

  function generateModLog(title, mod, user, action, reason) {
    logger.debug('Preparing moderation log embed.')
    var logColor = 0xDC9934
    var nick = message.guild.members.fetch(user.id)
    var date = getLocalTime(message)
    var logEmbed = new MessageEmbed()
      .setColor(logColor)
      .setTitle(title)
      .addFields(
        {
          name: `> User Info`,
          value: stripIndents`
                  **Username:** ${user}
                  **Nickname:** ${nick}
                  **Log Date:** ${date}
          `
        },
        {
          name: `> Details for ${action}`,
          value: stripIndents`
            Operator: ${mod}
            For ${(reason) ? reason: "No reason provided."}
          `
        }
      )
      .setThumbnail(user.displayAvatarURL({format:'png'}))
      .setFooter(
        'Bot created and maintained by NovaLynxie.',
        client.user.displayAvatarURL({ format: 'png' })
      );
    let guild = client.guilds.cache.get(message.guild.id);
    logChannels.forEach(channel => {
      let logChannel = guild.channels.cache.get(channel);
      if (logChannel && logChannel !== undefined) {
        logChannel.send(embed);
      };
    });
  }
  if (enableLogger === true) {
    let title, operator = message.author.tag;
    logger.info('Logging moderation action...')
    switch (action) { 
      case 'ban':
        // log user ban here.
        title = 'The ban hammer has spoken'
        action = 'Ban'
        generateModLog(title, operator, user, action, reason);
        break;
      case 'kick':
        // log user kick here.
        title = 'They have been kicked out.'
        action = 'Kick'
        generateModLog(title, operator, user, action, reason);
        break;
    };
  } else {
    // do nothing.
  };
};