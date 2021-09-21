const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const { format } = require('date-fns');
const logger = require('../../plugins/winstonLogger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Create a ticket for staff support in this server.')
    .addStringOption(option =>
      option
      .setName('category')
      .setDescription('Type of ticket?')
      .setRequired(true)
      .addChoice('Report', 'report')
      .addChoice('Question', 'question')
      .addChoice('Other', 'other')
    )
    .addStringOption(option => 
      option
        .setName('title')
        .setDescription('What is the support ticket for?')
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
    const ticketsChID = settings.logChannels.ticketsChID;
    let data = await client.data.get(guild);

    const suggestEmbed = new MessageEmbed()
      .setTitle(`Ticket - ${title}`)
      .setColor('#d4eb60')
      .setDescription(`Category ${category}`)
      .addFields(
        {
          name: 'Suggestion Info',
          value: stripIndents`
            Suggested by ${member.user.tag} (${member.displayName})
            Created ${format(new Date, 'PPPPpppp')}`
        },
        {
          name: 'Additional Details?',
          value: (details) ? details : 'No details provided!'
        }
      )
    
    const channel = client.channels.cache.get(ticketsChID); let thread;
    channel.send({ embeds: [suggestEmbed] }).then(async message => {
      thread = await message.startThread({
        name: `Discussion - ${title}`,
        autoArchiveDuration: 1440,
        type: 'private_thread',
        reason: 'Automatically generated for private ticket discussion.'
      });
      await thread.members.add(interaction.user.id);
      data.trackers.tickets.push({ messageID: message.id, authorID: interaction.user.id });
      await client.data.set(data, guild);
      interaction.reply(
        { content: `New ticket created in #${channel.name} and opened new thread for discussions!`, ephemeral: true }
      );
    }).catch(logger.error);
  }
};