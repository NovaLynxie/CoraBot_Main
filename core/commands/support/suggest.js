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
        .setName('details')
        .setDescription('Additional details? (Keep it brief)')
        .setRequired(false)
    ),
  async execute(interaction, client) {
    const member = interaction.member; const guild = interaction.guild;
    const title = interaction.options.getString('title');
    const category = interaction.options.getString('category');
    const details = interaction.options.getString('details');    
    const settings = await client.settings.guild.get(guild);
    const suggestChID = settings.logChannels.suggestChID;
    let data = await client.data.get(guild);

    const suggestEmbed = new MessageEmbed()
      .setTitle(`Suggestion - ${title}`)
      .setColor('#a8ffc2') // #d4eb60
      .setDescription(`Category ${category}`)
      .addFields(
        {
          name: 'Suggestion Info',
          value: stripIndents`
            Suggested by ${member.user.tag} (${member.displayName})
            Created ${format(new Date, 'PPPPpppp')}`
        },
        {
          name: 'Why should this be considered?',
          value: details
        }
      )
    
    const channel = client.channels.cache.get(suggestChID); let thread;
    channel.send({ embeds: [suggestEmbed] }).then(async message => {
      thread = await message.startThread({
        name: `Discussion - ${title}`,
        autoArchiveDuration: 60,
        reason: 'Automatically generated for suggestion discussion.'
      });
      message.react('👍'); message.react('👎');
      data.trackers.suggestions.push(message.id);
      await client.data.set(data, guild);
      interaction.reply(
        { content: `Suggestion created in #${channel.name} and opened new thread for discussions!`, ephemeral: true }
      );
    }).catch(console.error);
  }
};