const logger = require('../../utils/winstonLogger');
const wait = require('util').promisify(setTimeout);
const { SlashCommandBuilder, time } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Create a suggestion for a request in this server.')
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
    let data = await client.data.trackers.get(guild);

    const suggestEmbed = new MessageEmbed()
      .setTitle(`Suggestion - ${title}`)
      .setColor('#a8ffc2')
      .setDescription(`Category ${category}`)
      .addFields(
        {
          name: 'Suggestion Info',
          value: stripIndents`
            Suggested by ${member.user.tag} (${member.displayName})
            Created ${time(new Date)}`
        },
        {
          name: 'Additional Details?',
          value: (details) ? details : 'No details provided!'
        }
      )
    
    const channel = client.channels.cache.get(suggestChID); let thread;
    channel.send({ embeds: [suggestEmbed] }).then(async message => {
      thread = await message.startThread({
        name: `Discussion - ${title}`,
        autoArchiveDuration: 1440,
        reason: 'Automatically generated for suggestion discussion.'
      });
      await message.react('👍'); 
      await wait(3000);
      await message.react('👎');
      data.suggestions.push(message.id);
      await client.data.trackers.set(data, guild);
      interaction.reply(
        { content: `Suggestion created in #${channel.name} and opened new thread for discussions!`, ephemeral: true }
      );
    }).catch(logger.error);
  }
};