const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('Evaluate javascript to test code! (WARNING! CAN CAUSE DAMAGE! USE WITH CAUTION!)')
    .addStringOption(option => option.setName('code').setDescription('Enter code to execute')),
  async execute(interaction, client) {
    //
    // If the message author's ID does not equal
    // our ownerID, get outta there!
    if (client.options.owners.indexOf(interaction.user.tag) <= -1) {
      interaction.reply({
        content: `THAT IS A RESTRICTED COMMAND! YOU ARE NOT AUTHORIZED ${interaction.user.username}!`,
        ephemeral: true
      })
      logger.warn(`User ${interaction.user.tag} tried to use eval but is not an owner!`);
    };
    // This function cleans up and prepares the
    // result of our eval command input for sending
    // to the channel
    const clean = async (text) => {
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

      // Send off the cleaned up result
      return text;
    }
    // In case something fails, we to catch errors
    // in a try/catch block
    try {
      // Evaluate (execute) our input
      const evaled = eval(interaction.option.code.join(" "));

      // Put our eval result through the function
      // we defined above
      const cleaned = await clean(evaled);

      // Reply in the channel with our result
      interaction.reply({
        content: `\`\`\`js\n${cleaned}\n\`\`\``,
        ephemeral: true
      });
    } catch (err) {
      // Reply in the channel with our error
      interaction.reply({
        content: `\`ERROR\` \`\`\`xl\n${cleaned}\n\`\`\``,
        ephemeral: true
      });
    }
  }
}