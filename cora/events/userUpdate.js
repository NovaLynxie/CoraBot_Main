const botlogs = require('../modules/botLogger');
const logger = require('../providers/WinstonPlugin');

module.exports = {
  name: 'userUpdate',
  execute(oldUser, newUser) {
    let event = 'userUpdate', userdata = {oldUser, newUser};
    logger.data(`User's tag changed from ${oldUser.tag} to ${newUser.tag}`)
    botlogs(event, userdata, client);
  }
}