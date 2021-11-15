const logger = require('../utils/winstonLogger');
const { eventLog } = require('../plugins/guildLogger');

module.exports = {
	name: 'roleUpdate',
	execute(oldRole, newRole, client) {
    const guild =  oldRole.guild || newRole.guild;
    eventLog('roleUpdate', guild, { oldRole, newRole }, client);
	},
};