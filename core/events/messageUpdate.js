const logger = require('../utils/winstonLogger');
const { eventLog } = require('../plugins/guildLogger');

module.exports = {
  name: 'messageUpdate',
  execute(oldMessage, newMessage, client) {
    if (oldMessage.editedTimestamp === newMessage.editedTimestamp) return;
    if (oldMessage.content === newMessage.content) return;
    const guild = oldMessage.guild || newMessage.guild;
    const channel = oldMessage.channel || newMessage.channel;
    const member = oldMessage.member || newMessage.member;
    eventLog('messageUpdate', guild, { channel, member, oldMessage, newMessage }, client);
  },
};