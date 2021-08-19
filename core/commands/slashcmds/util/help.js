const { MessageActionRow, MessageButton } = require('discord.js');
const {config} = require('../../../handlers/bootloader'); const {dashboard} = config;
module.exports = {
  data: {
    name: 'help',
    category: 'util',
    description: "Provides a useful help embed and button menu!"
  },
	async execute(interaction, client) {    
    const helpButtons1 = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('allcommands')
          .setLabel('All Commands')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('settings')
          .setLabel('Bot Settings')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setLabel('Dashboard')
          .setStyle('LINK')
          .setURL(dashboard.dashDomain)
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
    await interaction.reply(
      {
        embeds: [helpEmbed],
        components: [helpButtons1],
      }
    );   
	},
};