const logger = require('../plugins/winstonLogger');
const { globalPrefix, ownerIDs } = require('../handlers/bootLoader');

module.exports = {
	name: 'messageCreate',
	async execute(message, client) {
		if (message.author.bot) return;

		let args;
		// handle messages in a guild
		if (message.guild) {
			let prefix;
			const data = {
				mode: 'r', guild: message.guild,
			};
			const guildSettings = await client.settings.guild.get(message.guild);
			const guildPrefix = guildSettings?.guildPrefix;

			prefix = (guildPrefix) ? guildPrefix : globalPrefix;

			// if we found a prefix, setup args; otherwise, this isn't a command
			if (!prefix) return;
			args = message.content.slice(prefix.length).trim().split(/\s+/);
		}
		else {
			// handle DMs
			const slice = message.content.startsWith(globalPrefix) ? globalPrefix.length : 0;
			args = message.content.slice(slice).split(/\s+/);
		}

		// get the first space-delimited argument after the prefix as the command
		const command = args.shift().toLowerCase();
	},
};