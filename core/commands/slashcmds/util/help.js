const { MessageActionRow, MessageButton } = require('discord.js');
module.exports = {
  data: {
    name: 'help',
    category: 'util',
    description: "Provides a useful help embed and button menu!"
  },
	async execute(interaction, client) {
    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('primary')
          .setLabel('Primary')
          .setStyle('PRIMARY')
      );
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