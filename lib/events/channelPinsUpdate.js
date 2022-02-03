const logger = require('../utils/winstonLogger');

module.exports = {
  name: 'channelPinsUpdate',
  execute(channel, time, client) {
    if (channel.type === 'DM') return;
    // ..
  },
};