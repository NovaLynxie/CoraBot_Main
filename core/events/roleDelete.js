const logger = require('../utils/winstonLogger');
const { eventLog } = require('../plugins/guildLogger');

module.exports = {
	name: 'roleDelete',
	execute(role, client) {
    const guild = role.guild;
    logger.debug(`Role ${role.name} deleted in ${guild.name}.`);
    eventLog('roleDelete', guild, { role }, client);
	},
};