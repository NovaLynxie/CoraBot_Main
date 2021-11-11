const notifier = require('../plugins/autoNotifier');
//const { modLogger, eventLogger } = require('../plugins/guildLogger');
const logger = require('../plugins/winstonLogger');

module.exports = {
  name: 'guildMemberAdd',
  execute(member, client) {
    const event = 'guildMemberAdd', data = {member, guild}, guild = member.guild;
    logger.debug('Detected user joining a linked guild.');
    logger.data(`${member.user.tag} (ID:${member.user.id}) joined guild ${guild.name}`);
    notifier(event, member, client);
    // wip event handler! not yet fully implemented.
    //eventLogger(event, data, client);
  }
}