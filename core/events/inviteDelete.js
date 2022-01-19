const logger = require('../utils/winstonLogger');
const { eventLog } = require('../plugins/guildLogger');

module.exports = {
  name: 'inviteDelete',
  async execute(invite, client) {
    const guild = invite.guild;
    logger.debug(`Invite removed for ${guild.name}.`);
    eventLog('inviteDelete', guild, { invite }, client);
  }
};