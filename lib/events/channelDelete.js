const logger = require('../utils/winstonLogger');

module.exports = {
  name: 'channelDelete',
  execute(channel, client) {
    if (channel.type === 'DM') return;
    // ..
  },
};