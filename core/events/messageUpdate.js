const logger = require('../utils/winstonLogger');

module.exports = {
  name: 'messageUpdate',
  execute(oldMessage, newMessage, client) {
    let event = 'messageDelete', msgs = { oldMessage, newMessage };
    // ...
    eventLog(event, msgs, client);
  },
};