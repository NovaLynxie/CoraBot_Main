const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Create a suggestion in this server.')
    .addStringOption(option =>
      option
      .setName('category')
      .setDescription('Type of suggestion?')
      .setRequired(true)
      .addChoice('Server', 'server')
      .addChoice('Community', 'community')
      .addChoice('Games', 'games')
      .addChoice('Events', 'events')
      .addChoice('Changes', 'changes')
      .addChoice('Other', 'other')
    )
    .addStringOption(option => 
      option
        .setName('title')
        .setDescription('What is your suggestion?')
        .setRequired(true)
    )
    .addStringOption(option => 
      option
        .setName('description')
        .setDescription('Add a brief explanation.')
        .setRequired(false)
    ),
  execute(interaction, client) {
    const title = interaction.options.getString('title');
    const category = interaction.options.getString('category');
    const description = interaction.options.getString('description');

    const suggestEmbed = new MessageEmbed()
      .setTitle(title)
      .setDescription(`Category ${category}`)
    
    let channel = client.channels.cache.get();
    channel.send({ embeds: [suggestEmbed] }).then(message => {
      message.react('👍'); message.react('👎');
    });    
    interaction.reply({ content: 'Suggestion created!', ephemeral: true })
  }
};