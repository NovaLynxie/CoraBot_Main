const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const { format } = require('date-fns');
const logger = require('../../plugins/winstonLogger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Create a ticket for staff support in this server.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('new')
        .setDescription('Create a ticket')
        .addStringOption(option => 
          option
            .setName('category')
            .setDescription('Category of the ticket issue?')
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
            .setDescription('Any additional details? (Keep it brief)')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List the user\'s open tickets.')
        .addUserOption(option =>
          option
            .setName('target')
            .setDescription('Get a specific user\'s tickets. (ADMIN ONLY!)')
            .setRequired(false)
        )
    ),
  async execute(interaction, client) {
    let title, category, details, data, thread;
    const subcmd = interaction.options.getSubcommand();
    const member = interaction.member; const guild = interaction.guild;
    const settings = await client.settings.guild.get(guild);
    const ticketsChID = settings.logChannels.ticketsChID;
    const channel = client.channels.cache.get(ticketsChID);

    data = await client.data.get(guild);
    title = interaction.options.getString('title');
    category = interaction.options.getString('category');
    details = interaction.options.getString('details');

    let ticketNo = data.trackers.tickets.length + 1;
    let ticketBaseEmbed = new MessageEmbed()
      .setTitle(`Ticket #${ticketNo} - ${title}`)
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
    let ticketListEmbed = new MessageEmbed()
      .setTitle('Tickets List System')
      .setColor('#d4eb60')
    
    function createTicket() {
      channel.send({ embeds: [ticketBaseEmbed] }).then(async message => {
        thread = await message.startThread({
          name: `Discussion - ${title}`,
          autoArchiveDuration: 1440,
          type: 'private_thread',
          reason: 'Automatically generated for private ticket discussion.'
        });
        await thread.members.add(interaction.user.id);
        data.trackers.tickets.push({ ticketNo, messageID: message.id, authorID: interaction.user.id });
        await client.data.set(data, guild);
        interaction.reply(
          { content: `New ticket created in #${channel.name} and opened new thread for discussions!`, ephemeral: true }
        );
      }).catch(logger.error);
    };
    async function listTickets() {
      if (data.trackers.tickets.length < -1) {
        for (const ticket of data.trackers.tickets) {
          logger.debug(`Fetching message with ID ${ticket.messageID}`);
          let author = await client.users.fetch(ticket.authorID);
          await channel.messages.fetch(ticket.messageID).then(message => {
            let embed = message.embeds[0];
            logger.debug(`Found a message with ID ${ticket.messageID}!`);
            logger.verbose(JSON.stringify(message, null, 2));
            ticketListEmbed.addFields(
              {
                name: embed.title,
                value: stripIndents`
                  Author: ${author.tag}
                  Created: ${format(message.createdAt, 'PPPPpppp')}
                  [Go to ticket](${message.url})`
              }
            );
          }).catch( error => {
            logger.debug(`No message exists with ID ${ticket.messageID}!`);
            return logger.debug(error.stack);
          });
        };
      } else {
        ticketListEmbed.addFields(
          {
            name: 'No tickets found!',
            value: stripIndents`
              You currently have no tickets open in this server.
              If you need to open a ticket, please use \`\`\`/ticket new\`\`\` in any text channel.`
          }
        );        
      };
      logger.verbose(JSON.stringify(ticketListEmbed, null, 2));
      logger.debug('Sending ticket list embed now!');
      interaction.reply(
        {
          embeds: [ticketListEmbed],
          ephemeral: true
        }
      );
    };
    if (subcmd === 'new') {
      createTicket();
    } else
    if (subcmd === 'list') {
      listTickets();
    } else
    if (subcmd === 'close') {
      //
    }
  }
};