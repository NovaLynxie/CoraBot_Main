const logger = require('../utils/winstonLogger');
const { eventLog } = require('../plugins/guildLogger');

module.exports = {
  name: 'messageUpdate',
  execute(oldMessage, newMessage, client) {
    const guild = oldMessage.guild || newMessage.guild;
    const event = 'messageDelete', msgs = { oldMessage, newMessage };
    // ...
    eventLog(event, guild, { msgs }, client);
  },
};