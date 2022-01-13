const logger = require('../utils/winstonLogger');
const { eventLog } = require('../plugins/guildLogger');

module.exports = {
  name: 'guildScheduledEventCreate',
  execute(guildScheduledEvent, client) {
    const event = 'guildScheduledEventDelete'; 
    const guild = guildScheduledEvent.guild;
    const channel = guildScheduledEvent.channel;
    const creator = guildScheduledEvent.creator;
    logger.debug('New guild event scheduled!');
    logger.data(`${guildScheduledEvent.name} (ID:${guildScheduledEvent.id}) created in guild ${guild.name}`);
    eventLog(event, guild, { channel, creator, guildScheduledEvent }, client);
  }
}