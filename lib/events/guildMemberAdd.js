const logger = require('../utils/winstonLogger');
const notifier = require('../plugins/autoNotifier');
const { eventLog } = require('../plugins/guildLogger');

module.exports = {
  name: 'guildMemberAdd',
  execute(member, client) {
    const event = 'guildMemberAdd', guild = member.guild;
    logger.debug('Detected user joining a linked guild.');
    logger.data(`${member.user.tag} (ID:${member.user.id}) joined guild ${guild.name}`);
    notifier(event, member, client);
    eventLog(event, guild, { member }, client);
  }
}