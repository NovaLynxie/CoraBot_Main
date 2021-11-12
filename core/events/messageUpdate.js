const logger = require('../utils/winstonLogger');
const { eventLog } = require('../plugins/guildLogger');

module.exports = {
  name: 'messageUpdate',
  execute(oldMessage, newMessage, client) {
    const guild = oldMessage.guild || newMessage.guild;
    const channel = oldMessage.channel || newMessage.channel;
    const member = oldMessage.member || newMessage.member;
    eventLog('messageDelete', guild, channel, { member, oldMessage, newMessage }, client);
  },
};