const logger = require('../utils/winstonLogger');
const { eventLog } = require('../plugins/guildLogger');

module.exports = {
	name: 'roleCreate',
	execute(role, client) {
    const guild = role.guild;
    // ..
    eventLog('roleCreate', guild, { role }, client);
	},
};