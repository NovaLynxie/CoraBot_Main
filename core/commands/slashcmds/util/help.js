const { MessageActionRow, MessageButton } = require('discord.js');
const logger = require('../../../plugins/winstonplugin');
const {config} = require('../../../handlers/bootloader'); const {dashboard} = config;
module.exports = {
  data: {
    name: 'help',
    category: 'util',
    description: "Provides a useful help embed and button menu!"
  },
	async execute(interaction, client) {
    const buttonIDs = ['allcommands', 'botsettings'];
    const filter = i => buttonIDs.indexOf(i.customId);
    const collector = interaction.channel.createMessageComponentCollector({ time: 30000}); 

    const helpButtons1 = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('allcommands')
          .setLabel('All Commands')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('botsettings')
          .setLabel('Bot Settings')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setLabel('Dashboard')
          .setStyle('LINK')
          .setURL(dashboard.dashDomain),
          new MessageButton()
          .setCustomId('closemenu')
          .setLabel('Close Menu')
          .setStyle('DANGER'),
      );
    const helpEmbed = {
      color: '#0099ff',
      title: 'Help Menu',
      description: 'Welcome to the help menu!',
      fields: [
        {
          name: 'Commands (WIP)',
          value: `
          This lists all the prefix and slash commands.
          Tap the 'Commands' button to open the help menu.
          `
        },
        {
          name: 'Settings (WIP)',
          value: `
          Configure the bot prefix, modules and other options from here.
          Tap the settings button to open the menu.
          `
        },
        {
          name: 'Dashboard (WIP)',
          value: `
          You can use the dashboard to configure the bot, join or leave any server you are linked to!
          Tap the Dashboard button to bring you to the web dashboard.
          `
        }
      ]
    };
    // Internal help menu collector.
    collector.on('collect', async i => {
      switch (i.customId) {
        case 'allcommands':
          await i.update(
            {
              content: 'allcommands.button.triggered', 
              embeds: [helpEmbed], 
              components: [helpButtons1]
            }
          );
          break;
        case 'botsettings':
          await i.update(
            {
              content: 'botsettings.button.triggered', 
              embeds: [helpEmbed], 
              components: [helpButtons1]
            }
          );
          break;
        case 'closemenu':
          await i.update(
            {
              content: 'Help menu closed. Have a nice day! :D',
              ephemeral: true
            }
          );
          break;
        default: 
          logger.warn('Invalid button pressed for this menu!')
          await i.update(
            {
              content: 'That button is invalid or not recognised in this menu!', 
              embeds: [helpEmbed], 
              components: [helpButtons1]
            }
          );
      };
    });
    // Log on collector end (temporary)
    collector.on('end', collected => logger.debug(`Collected ${collected.size} items`));

    await interaction.reply(
      {
        embeds: [helpEmbed],
        components: [helpButtons1],
      }
    );   
	},
};