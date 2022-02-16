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
    let time = process.hrtime();
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
      if (text && text.constructor.name == 'Promise') { text = await text; };
      if (typeof text !== 'string') { text = require('util').inspect(text, { depth: 1 }); }
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
      logger.verbose(first); logger.verbose(rest);
      time = process.hrtime(time);
      const end = {
        content: `
        ⚙️ Executed in ${time[0]}s (${time[1]}ns)`, ephemeral: true
      };
      await interaction.editReply({
        content: `
        ⌨️ Code Input
        \`\`\`js\n${input}\`\`\`
        `
      });
      await interaction.followUp({
        content: `
        📜 Eval Output
        \`\`\`js\n${first}\n\`\`\``,
        ephemeral: true,
      });
      if (!rest.length) return interaction.followUp(end);
      for (const text of rest) {
        await wait(500);
        await interaction.followUp({
          content: `
          \`\`\`js\n${text}\n\`\`\``, ephemeral: true
        });
      }; await interaction.followUp(end);
    } catch (err) {
      logger.debug(err.stack);
      await interaction.editReply({
        content: `\`ERROR\` \`\`\`xl\n${err}\n\`\`\``, ephemeral: true
      });
      logger.debug(err.stack);
    }
  },
};