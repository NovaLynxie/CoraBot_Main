const logger = require('../utils/winstonLogger');
const { eventLog } = require('../plugins/guildLogger');

module.exports = {
	name: 'roleCreate',
	execute(role, client) {
    const guild = role.guild;
    logger.debug(`Role ${role.name} created in ${guild.name}.`);
    eventLog('roleCreate', guild, { role }, client);
	},
};