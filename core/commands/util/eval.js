const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../../plugins/winstonLogger');
// source: https://anidiots.guide/examples/making-an-eval-command
module.exports = {
	data: new SlashCommandBuilder()
		.setName('eval')
		.setDescription('Evaluate javascript to test code! (WARNING! CAN CAUSE DAMAGE! USE WITH CAUTION!)')
		.addStringOption(option => option.setName('code').setDescription('Enter code to execute')),
	async execute(interaction, client) {
		if (client.options.owners.indexOf(interaction.user.id) <= -1) {
			interaction.reply({
				content: `THAT IS A RESTRICTED COMMAND! YOU ARE NOT AUTHORIZED ${interaction.user.username}!`,
				ephemeral: true,
			});
			logger.warn(`User ${interaction.user.tag} tried to use eval but is not an owner!`);
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
			logger.debug(cleaned);
			interaction.reply({
				content: `
        \`input: '${input}'\`
        \`\`\`js\n${cleaned}\n\`\`\``,
				ephemeral: true,
			});
		}
		catch (err) {
			if (err.message === 'Must be 2000 or fewer in length') {
				interaction.reply({
					content: `\`ERROR\` \`\`\`xl\n${err}\n\`\`\``,
					ephemeral: true,
				});
			}
			else {
				interaction.reply({
					content: `\`ERROR\` \`\`\`xl\n${err}\n\`\`\``,
					ephemeral: true,
				});
			}
			logger.debug(err.stack);
		}
	},
};