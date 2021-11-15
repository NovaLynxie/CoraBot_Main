const logger = require('../utils/winstonLogger');
const { eventLog } = require('../plugins/guildLogger');

module.exports = {
	name: 'roleDelete',
	execute(role, client) {
    const guild = role.guild;
    eventLog('roleDelete', guild, { role }, client);
	},
};