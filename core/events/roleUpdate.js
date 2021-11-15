const logger = require('../utils/winstonLogger');
const { eventLog } = require('../plugins/guildLogger');

module.exports = {
	name: 'roleUpdate',
	execute(role, client) {
    const guild = role.guild;
    // ..
    eventLog('roleCreate', guild, { role }, client);
	},
};