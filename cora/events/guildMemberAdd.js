const announcer = require('../modules/autoNotifier');
const botlogs = require('../modules/botLogger');
const logger = require('../providers/WinstonPlugin');

module.exports = {
  name: 'guildMemberAdd',
  execute(member, client) {
    let event = 'guildMemberAdd', data = {member, guild}, guild = member.guild;
    logger.debug('Detected user joining a linked guild.');
    logger.data(`${member.user.tag} (ID:${member.user.id}) joined guild ${guild.name}`);
    // announcer handler - experimental!
    announcer(event, member, client);
    // wip event handler! not yet fully implemented.
    botlogs(event, data, client);
  }
}