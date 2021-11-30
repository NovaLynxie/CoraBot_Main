const logger = require('../utils/winstonLogger');
const botEmbed = require('../utils/botEmbeds');
const { eventLog } = require('../plugins/guildLogger');

module.exports = {
  name: 'inviteCreate',
  async execute(invite, client) {
    const guild = invite.guild;
    logger.debug(`Invite generated for ${(guild) ? guild.name 'a linked server'}.`);
    eventLog('inviteCreate', guild, { invite }, client);
  }
};