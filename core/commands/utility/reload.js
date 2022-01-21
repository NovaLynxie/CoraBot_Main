const logger = require('../../utils/winstonLogger');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Force an update of the app (/) commands.')
    .addStringOption(option =>
      option
        .setName('command')
        .setDescription('Specify the name of the command to reload')
        .setRequired(false)
    ),
  async execute(interaction, client) {
    if (client.options.owners.indexOf(interaction.user.id) <= -1) {
      interaction.reply({
        content: `THAT IS A RESTRICTED COMMAND! YOU ARE NOT AUTHORIZED ${interaction.user.username}!`,
        ephemeral: true,
      });
      logger.warn(`User ${interaction.user.tag} tried to use eval but is not an owner!`);
      return;
    };
    const cmdName = interaction.options.getString('command');    
    if (cmdName) {
      if (client.commands.has(cmdName)) {
        try {
          logger.debug(`Reloading command with name ${cmdName}.`);
          client.utils.cmds.reloadCmd(client, cmdName);
          interaction.reply({
            content: `
            Reloaded command \`${cmdName}\`!`,
            ephemeral: true,
          });
        } catch (error) {
          interaction.reply({
            content: `Error occured while reloading command. \n\`\`\` ${error}\`\`\``
          });
        };
      } else {
        interaction.reply({
          content: 'That command does not exist or was loaded!', ephemeral: true
        });
      };      
    } else {
      logger.debug('Reloading all bot/app commands now.');
      try {        
        const res = await client.utils.cmds.reloadAll(client);
        logger.debug('Finished reloading all commands!');
        interaction.reply({
          content: `
          Reloaded all bot commands. \`${res.success} loaded ${res.failed} errored\``,
          ephemeral: true,
        });
      } catch (error) {
        interaction.reply({
          content: `Error occured while loading some commands. \n\`\`\` ${error}\`\`\``,
          ephemeral: true,
        });
      };
    };
  },
};