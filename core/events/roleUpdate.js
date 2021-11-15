const logger = require('../utils/winstonLogger');
const { eventLog } = require('../plugins/guildLogger');

module.exports = {
	name: 'roleUpdate',
	execute(oldRole, newRole, client) {
    const guild =  oldRole.guild || newRole.guild;
    logger.debug(`Role ${oldRole.name || newRole.name} updated in ${guild.name}.`);
    eventLog('roleUpdate', guild, { oldRole, newRole }, client);
	},
};