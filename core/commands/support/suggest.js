const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const { format } = require('date-fns');

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
  async execute(interaction, client) {
    const member = interaction.member; const guild = interaction.guild;
    const title = interaction.options.getString('title');
    const category = interaction.options.getString('category');
    const description = interaction.options.getString('description');    
    const settings = await client.settings.guild.get(guild);
    const suggestChID = settings.logChannels.suggestChID;
    let data = await client.data.get(guild);
    let suggestions = data.trackers.suggestions;

    const suggestEmbed = new MessageEmbed()
      .setTitle(title)
      .setDescription(`Category ${category}`)
      .addFields(
        {
          name: 'Suggestion Details',
          value: stripIndents`
            Suggested by ${member.user.tag} (${member.displayName})
            Created on ${format(new Date, 'PPPPpppp')}`
        }
      )
    
    const channel = client.channels.cache.get(suggestChID);
    channel.send({ embeds: [suggestEmbed] }).then(async message => {
      message.react('👍'); message.react('👎');
      suggestions.push(message.id);
      await client.data.set(guild, data);
    });
    interaction.reply(
      { content: 'Suggestion created!', ephemeral: true }
    );    
  }
};