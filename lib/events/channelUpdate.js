const logger = require('../utils/winstonLogger');

module.exports = {
  name: 'channelUpdate',
  execute(oldChannel, newChannel, client) {
    if (oldChannel.type === 'DM' || newChannel.type === 'DM') return;
    // ..
  },
};