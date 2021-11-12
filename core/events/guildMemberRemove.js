const logger = require('../utils/winstonLogger');
const notifier = require('../plugins/autoNotifier');
const { eventLog } = require('../plugins/guildLogger');

module.exports = {
  name: 'guildMemberRemove',
  execute(member, client) {
    const event = 'guildMemberRemove', data = {member}, guild = member.guild;
    logger.debug('Detected user leaving a linked guilds.');
    logger.data(`${member.user.tag} (ID:${member.user.id}) left guild ${guild.name}`);
    // wip event handler! not yet fully implemented.
    eventLog(event, data, client);
  }
};