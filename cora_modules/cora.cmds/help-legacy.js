const fs = require('fs')
// to be re-written for embedded msg.
module.exports = {
	name: 'help-legacy',
	description: 'List all available commands (LEGACY)',
	execute(message) {
		let str = '';
		const commandFiles = fs.readdirSync('./zeon_cmds').filter(file => file.endsWith('.js'));

		for (const file of commandFiles) {
			const command = require(`./${file}`);
			str += `Name: ${command.name}, Description: ${command.description} \n`;
		}

		message.channel.send(str);
	},
};