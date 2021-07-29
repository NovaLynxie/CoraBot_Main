const logger = require('../providers/WinstonPlugin');
const { stripIndents } = require('common-tags');

module.exports = (member, event) => {
  let announcerSettings = guild.settings.get('announcer', undefined);
  // stop if not enabled or settings are missing/undefined.
  if (!announcerSettings || announcerSettings === undefined) return;
  if (!announcerSettings.enableNotifier) return; 
  // fetch guild information and event data.
  let guild = member.guild, msgdata;  
  let {notifsChannel, events, eventMessages} = announcerSettings;
  let channel = guild.channels.cache.find(ch => ch.id === notifsChannel);
  // event handler - checks event and gets required message template
  if (event === 'guildMemberAdd') {
    msgdata = eventMessages.userJoin;
  } else
  if (event === 'guildMemberRemove') {
    msgdata = eventMessages.userLeave;
  } else {
    return logger.debug('Unknown or invalid event name! Maybe wrongly parsed?');
  }
  msgdata = msgdata.replace(/(<user>)/gi, `<@${member.id}>`);
  try {
    logger.debug(`Attempting to send message to ${channel.id}...`);
    channel.send(msgdata);
    logger.debug('Announcer message has been sent.');
  } catch (err) {
    logger.error('Announcer module encountered an error while executing!');
    logger.error(err.message); logger.debug(err.stack);
  }
};