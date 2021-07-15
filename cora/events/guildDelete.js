const logger = require('../providers/WinstonPlugin');

module.exports = {
  name: 'guildDelete',
  execute(guild, client) {
    logger.info(`${client.user.tag} left ${guild.name}!`);
    logger.debug(`${client.user.tag} left ${guild.name} (${guild.id}).`);
}