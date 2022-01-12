const logger = require('../../utils/winstonLogger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { Util } = require('discord.js');
const wait = require('util').promisify(setTimeout);

// source: https://anidiots.guide/examples/making-an-eval-command
module.exports = {
	data: new SlashCommandBuilder()
		.setName('eval')
		.setDescription('Evaluate javascript to test code! (OWNER ONLY)')
		.addStringOption(option => option.setName('code').setDescription('Enter code to execute')),
	async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
		if (client.options.owners.indexOf(interaction.user.id) <= -1) {
			interaction.reply({
				content: `THAT IS A RESTRICTED COMMAND! YOU ARE NOT AUTHORIZED ${interaction.user.username}!`,
				ephemeral: true,
			});
			logger.warn(`User ${interaction.user.tag} tried to use eval but is not an owner!`);
      return;
		};
		const clean = async (client, text) => {
			if (text && text.constructor.name == 'Promise') {text = await text;};
			if (typeof text !== 'string') {text = require('util').inspect(text, { depth: 1 });}
			text = text
				.replace(/`/g, '`' + String.fromCharCode(8203))
				.replace(/@/g, '@' + String.fromCharCode(8203));
			text = text.replaceAll(client.token, '[REDACTED]');
			return text;
		};
		try {
			const input = interaction.options.getString('code');
			logger.debug(`input => ${input}`);
			const evaled = eval(input);
			const cleaned = await clean(client, evaled);
      const [first, ...rest] = Util.splitMessage(cleaned, { maxLength: 1920 });
      logger.debug(first); logger.debug(`first.length => ${first.length}`);
      if (!rest.length) {
        await interaction.editReply({
          content: `
          \`\`\`js\n${first}\n\`\`\``,
          ephemeral: true,
        });
        return;
      } else {
        await interaction.editReply({
          content: `
          \`\`\`js\n${first}\n\`\`\``,
          ephemeral: true,
        });
      };
      for (const text of rest) {
        logger.debug(`length of rest ${rest.length}`);
        await wait(500);
        await interaction.followUp({
          content: `
          \`\`\`js\n${text}\n\`\`\``,
          ephemeral: true,
        });
      };
		}	catch (err) {
      logger.error(err.message); logger.debug(err.stack);
			if (err.message.startsWith('Invalid Form Body') > -1 ) {
				interaction.reply({
					content: `\`ERROR\` \`\`\`xl\n${err}\n\`\`\``,
					ephemeral: true,
				});
			} else {
				interaction.reply({
					content: `\`ERROR\` \`\`\`xl\n${err}\n\`\`\``,
					ephemeral: true,
				});
			}
			logger.debug(err.stack);
		}
	},
};