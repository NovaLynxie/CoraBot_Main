const logger = require('../utils/winstonLogger');
const { debug } = require('../handlers/bootLoader').config;

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    const toObject = (key, value) => typeof value === 'bigint' ? value.toString() : value;
    if (debug) logger.data(JSON.stringify(interaction, toObject, 2));
    if (!interaction.guild) return await interaction.reply({
      content: "Commands are disabled outside of server chat channels!"
    });
    if (interaction.channel.type !== 'GUILD_TEXT') return await interaction.reply({
      content: "My commands can only be run in a server's text channel."
    });
    if (interaction.isCommand()) {
      logger.debug(`${interaction.user.tag} in #${interaction.channel.name} from ${interaction.guild.name} triggered interaction '${interaction.commandName}'`);
      if (!client.commands.has(interaction.commandName)) {
        await interaction.reply({
          embeds: [await client.utils.embeds.system('warn', { response: `Unknown or unrecognised command \`${interaction.commandName}\`.`, title: 'Unknown Command Error!' })],
          ephemeral: true
        })
      } else {
        try {
          await client.commands.get(interaction.commandName).execute(interaction, client);
        } catch (error) {
          logger.error(error.message); logger.debug(error.stack);
          await interaction.editReply({
            embeds: [await client.utils.embeds.system('error', { error, title: 'Command Interaction Error!' })],
            ephemeral: true
          });
        };
      };
    } else if (interaction.isButton()) {
      logger.debug(`${interaction.user.tag} in #${interaction.channel.name} from ${interaction.guild.name} triggered componentType=${interaction.componentType} -> id=${interaction.customId}`);
    } else if (interaction.isSelectMenu()) {
      logger.debug(`${interaction.user.tag} in #${interaction.channel.name} from ${interaction.guild.name} triggered componentType=${interaction.componentType} -> id=${interaction.customId}`);
    } else {
      logger.debug('Invalid or malformed interaction called!');
    };
  },
};