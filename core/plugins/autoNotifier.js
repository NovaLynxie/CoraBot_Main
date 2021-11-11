const logger = require('../plugins/WinstonLogger');
const { stripIndents } = require('common-tags');

module.exports = async (member, event, client) => {
  const guild = member.guild; let msgdata;
  const { notifier } = await client.settings.guild.get(guild);
  if (!notifier || notifier === undefined) return;
  if (!notifier.enableNotifier) return;  
  const {notifsChannel, trackEvents, eventMsgTxt} = notifier;
  const channel = guild.channels.cache.find(ch => ch.id === notifsChannel);
  if (event === 'guildMemberAdd') {
    msgdata = eventMsgTxt.joinMsg;
  } else
  if (event === 'guildMemberRemove') {
    msgdata = eventMsgTxt.leaveMsg;
  } else {
    return logger.debug('Unknown or invalid event name! Maybe wrongly parsed?');
  };
  msgdata = msgdata.replace(/(@user)/gi, `<@${member.id}>`);
  try {
    logger.debug(`Attempting to send message to ${channel.id}...`);
    channel.send(msgdata);
    logger.debug('Announcer message has been sent.');
  } catch (err) {
    logger.error('Announcer module encountered an error while executing!');
    logger.error(err.message); logger.debug(err.stack);
  }
};