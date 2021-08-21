const logger = require('../plugins/winstonlogger');
const {globalPrefix, ownerIDs} = require('../handlers/bootloader');
const {storeHandler} = require('../handlers/storehandler');

module.exports = {
	name: 'messageCreate',
	async execute(message, client) {
		if (message.author.bot) return;

    let args;
    // handle messages in a guild
    if (message.guild) {
      let prefix;
      let data = {
        mode: 'r', guild: message.guild
      };
      const guildSettings = await storeHandler(data, client);
      const { guildPrefix } = guildSettings;

      prefix = (guildPrefix) ? guildPrefix : globalPrefix;

      /*
      if (message.content.startsWith(globalPrefix)) {
        prefix = globalPrefix;
      } else {
        // check the guild-level prefix
        let data = {
          mode: 'r', // single character only!
          guild: message.guild
        };  
        const guildSettings = await storeHandler(data, client);
        const {guildPrefix} = guildSettings;
        if (message.content.startsWith(guildPrefix)) prefix = guildPrefix;
      }
      */

      // if we found a prefix, setup args; otherwise, this isn't a command
      if (!prefix) return;
      args = message.content.slice(prefix.length).trim().split(/\s+/);
    } else {
      // handle DMs
      const slice = message.content.startsWith(globalPrefix) ? globalPrefix.length : 0;
      args = message.content.slice(slice).split(/\s+/);
    }

    // get the first space-delimited argument after the prefix as the command
    const command = args.shift().toLowerCase();
	},
};