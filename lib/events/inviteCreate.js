const logger = require('../utils/winstonLogger');
const { eventLog } = require('../plugins/guildLogger');

module.exports = {
  name: 'inviteCreate',
  async execute(invite, client) {
    const guild = invite.guild;
    logger.debug(`Invite generated for ${guild.name}.`);
    eventLog('inviteCreate', guild, { invite }, client);
  }
};