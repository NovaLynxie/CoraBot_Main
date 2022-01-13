const logger = require('../utils/winstonLogger');
const notifier = require('../plugins/autoNotifier');
const { eventLog } = require('../plugins/guildLogger');

module.exports = {
  name: 'guildScheduledEventUpdate',
  execute(oldGuildScheduledEvent, newGuildScheduledEvent, client) {
    const event = 'guildScheduledEventUpdate';
    const guild = oldGuildScheduledEvent.guild || newGuildScheduledEvent.guild;
    const channel = oldGuildScheduledEvent.channel || newGuildScheduledEvent.channel;
    const creator = oldGuildScheduledEvent.creator || newGuildScheduledEvent.creator;
    eventLog(event, guild, { channel, creator, oldGuildScheduledEvent,  newGuildScheduledEvent }, client);
  }
}