const { MessageActionRow, MessageButton } = require('discord.js');
module.exports = {
  data: {
    name: 'help',
    category: 'util',
    description: "Provides a useful help embed and button menu!"
  },
	async execute(interaction, client) {
    /*
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('primary')
          .setLabel('Primary')
          .setStyle('PRIMARY'),
        new MessageButton()
          .setLabel('Dashboard')
          .setStyle('LINK')
      );
    */
    const row = {
      MessageActionRow: {
        type: 'ACTION_ROW',
        components: [
          MessageButton: {
            type: 'BUTTON',
            label: 'Settings',
            customId: 'settings',
            style: 'PRIMARY',
            emoji: null,
            url: 'https://zeonbot.novalynxie.repl.co',
            disabled: false
          },
          MessageButton {
            type: 'BUTTON',
            label: 'Dashboard',
            customId: null,
            style: 'LINK',
            emoji: null,
            url: 'https://zeonbot.novalynxie.repl.co',
            disabled: false
          }
        ]
      }
    }
    console.log(row);
    const helpEmbed = {
      color: '#0099ff',
      title: 'Help Menu',
      url: 'https://discord.js.org',
      description: 'WIP! This menu is not yet ready!'
    };
    await interaction.reply(
      { 
        embeds: [helpEmbed],
        components: [row],
      }
    );
	},
};