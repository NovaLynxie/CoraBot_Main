const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../../../plugins/winstonLogger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('Evaluate javascript to test code! (WARNING! CAN CAUSE DAMAGE! USE WITH CAUTION!)')
    .addStringOption(option => option.setName('code').setDescription('Enter code to execute')),
  async execute(interaction, client) {
    // If the message author's ID does not match
    // our configured owners list, get outta there!
    if (client.options.owners.indexOf(interaction.user.id) <= -1) {
      interaction.reply({
        content: `THAT IS A RESTRICTED COMMAND! YOU ARE NOT AUTHORIZED ${interaction.user.username}!`,
        ephemeral: true
      })
      logger.warn(`User ${interaction.user.tag} tried to use eval but is not an owner!`);
    };
    // This function cleans up and prepares the
    // result of our eval command input for sending
    // to the channel
    const clean = async (client, text) => {
      // If our input is a promise, await it before continuing
      if (text && text.constructor.name == "Promise")
        text = await text;

      // If the response isn't a string, `util.inspect()`
      // is used to 'stringify' the code in a safe way that
      // won't error out on objects with circular references
      // (like Collections, for example)
      if (typeof text !== "string")
        text = require("util").inspect(text, { depth: 1 });

      // Replace symbols with character code alternatives
      text = text
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203));
      // Then you will need to place this inside the
      // clean function, before the result is returned.
      text = text.replaceAll(client.token, "[REDACTED]");
      // Send off the cleaned up result
      return text;
    }
    // In case something fails, we to catch errors
    // in a try/catch block
    try {
      // Evaluate (execute) our input
      const input = interaction.options.getString('code');
      logger.debug(`input => ${input}`);
      const evaled = eval(input);
      // Put our eval result through the function we defined above
      const cleaned = await clean(client, evaled);
      logger.debug(cleaned);
      // Reply in the channel with our result
      interaction.reply({
        content: `
        \`input: '${input}'\`
        \`\`\`js\n${cleaned}\n\`\`\``,
        ephemeral: true
      });
    } catch (err) {
      // Reply in the channel with our error
      if (err.message === 'Must be 2000 or fewer in length') {
        interaction.reply({
          content: `\`ERROR\` \`\`\`xl\n${err}\n\`\`\``,
          ephemeral: true
        });
      } else {
        interaction.reply({
          content: `\`ERROR\` \`\`\`xl\n${err}\n\`\`\``,
          ephemeral: true
        });  
      };
      logger.debug(err.stack);
    }
  }
}