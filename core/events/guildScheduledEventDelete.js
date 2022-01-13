const logger = require('../utils/winstonLogger');
const { eventLog } = require('../plugins/guildLogger');

module.exports = {
  name: 'guildScheduledEventDelete',
  execute(guildScheduledEvent, client) {
    const event = 'guildScheduledEventDelete'; 
    const guild = guildScheduledEvent.guild;
    const channel = guildScheduledEvent.channel;
    const creator = guildScheduledEvent.creator;
    logger.debug('A scheduled guild event was deleted!');
    logger.data(`${guildScheduledEvent.name} (ID:${guildScheduledEvent.id}) removed in guild ${guild.name}`);
    eventLog(event, guild, { channel, creator, guildScheduledEvent }, client);
  }
}