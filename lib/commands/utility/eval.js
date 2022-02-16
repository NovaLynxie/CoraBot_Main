const logger = require('../../utils/winstonLogger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Util } = require('discord.js');
const wait = require('util').promisify(setTimeout);
// source: https://anidiots.guide/examples/making-an-eval-command
module.exports = {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('Evaluate javascript to test code! (OWNER ONLY)')
    .addStringOption(option => option.setName('code').setDescription('Enter code to execute')),
  async execute(interaction, client) {
    const evalEmbed = new MessageEmbed().setTitle('🖥️ Code Evaluator 🛠️').setColor('#8293ad');
    let time = process.hrtime();
    await interaction.deferReply({});
    if (client.options.owners.indexOf(interaction.user.id) <= -1) {
      evalEmbed.setColor('#e8522c')
        .setDescription(`THAT IS A RESTRICTED COMMAND! YOU ARE NOT AUTHORIZED ${interaction.user.username}!`);
      logger.warn(`User ${interaction.user.tag} tried to use eval but is not an owner!`);
      return interaction.reply({ embeds: [evalEmbed] });
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
    const input = interaction.options.getString('code');
    try {
      evalEmbed.setColor('#d9ae68')
        .setDescription('Parsing code inputs...').setTimestamp();
      await interaction.editReply({ embeds: [evalEmbed], });
      const evaled = eval(input); logger.debug(`input => ${input}`);
      const cleaned = await clean(client, evaled);
      const [first, ...rest] = Util.splitMessage(cleaned, { maxLength: 1920 });
      logger.verbose(first); logger.verbose(rest);
      time = process.hrtime(time);
      const end = {
        content: `⚙️ Executed in ${time[0]}s (${time[1]}ns)`,
      };
      evalEmbed.setColor('#d9cd68')
        .setDescription(`⌨️ Code Input \n\`\`\`js\n${input}\`\`\``)
        .setTimestamp();
      await interaction.editReply({ embeds: [evalEmbed] });
      evalEmbed.setColor('#68d991')
        .setDescription(`📜 Eval Output \n\`\`\`js\n${first}\n\`\`\``)
        .setTimestamp();
      await interaction.followUp({ embeds: [evalEmbed] });
      if (!rest.length) {
        evalEmbed.setColor('#21d162')
          .setDescription(`⚙️ Executed in ${time[0]}s (${time[1]}ns)`)
          .setTimestamp();
        return interaction.followUp({ embeds: [evalEmbed] });
      };
      for (const text of rest) {
        await wait(500);
        evalEmbed.setColor('#68d991')
          .setDescription(`\`\`\`js\n${text}\n\`\`\``)
          .setTimestamp()
        await interaction.followUp({ embeds: [evalEmbed] });
      };
      evalEmbed.setColor('#21d162')
        .setDescription(`⚙️ Executed in ${time[0]}s (${time[1]}ns)`)
        .setTimestamp();
      await interaction.followUp({ embeds: [evalEmbed] });
    } catch (err) {
      logger.debug(err.stack);
      evalEmbed.setColor('#bf331b')
        .setDescription(`\`ERROR\` \`\`\`xl\n${err}\n\`\`\``)
        .setTimestamp();
      await interaction.editReply({ embeds: [evalEmbed] });
      logger.debug(err.stack);
    }
  },
};