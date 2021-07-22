const botlogs = require('../modules/botLogger');
const logger = require('../providers/WinstonPlugin');

module.exports = {
  name: 'guildMemberRemove',
  execute(member, client) {
    let event = 'guildMemberRemove', data = {member}, guild = member.guild;
    logger.debug('Detected user leaving a linked guilds.');
    logger.data(`${member.user.tag} (ID:${member.user.id}) left guild ${guild.name}`);
    // wip event handler! not yet fully implemented.
    botlogs(event, data, client);
  }
}