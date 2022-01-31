const logger = require('../../utils/winstonLogger');
const { SlashCommandBuilder, time } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const { stripIndents } = require('common-tags');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Create a ticket for support in this server.')
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
            .setDescription('Additional details? (Keep it short and brief)')
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
    const { guild, member, options } = interaction;
    const subcmd = options.getSubcommand();
    const settings = await client.settings.guild.get(guild);
    const ticketsChID = settings.logChannels.ticketsChID;
    const channel = client.channels.cache.get(ticketsChID);
    data = await client.data.trackers.get(guild);
    title = interaction.options.getString('title');
    category = interaction.options.getString('category');
    details = interaction.options.getString('details');
    let ticketNo = data.tickets.length + 1;
    let ticketID = uuidv4();
    let ticketTitle = `Ticket #${ticketNo} - ${title}`;
    let ticketBaseEmbed = new MessageEmbed()
      .setTitle(ticketTitle)
      .setColor('#d4eb60')
      .setDescription(`Category ${category}`)
      .addFields(
        {
          name: 'Ticket Data',
          value: stripIndents`
            Ticket ID: ${ticketID.substr(0, 8)}
            Author: ${member.user.tag} (${member.displayName})
            Opened: ${time(new Date)}`
        },
        {
          name: 'Reason for opening ticket?',
          value: (details) ? details : 'No reason was provided!'
        }
      )
    let ticketListEmbed = new MessageEmbed()
      .setTitle('Tickets List System')
      .setColor('#d4eb60');
    function createTicket() {
      channel.send({ embeds: [ticketBaseEmbed] }).then(async message => {
        thread = await message.startThread({
          name: `Discussion - ${title}`,
          autoArchiveDuration: 1440,
          type: 'private_thread',
          reason: 'Automatically generated for private ticket discussion.'
        });
        await thread.members.add(interaction.user.id);
        data.tickets.push(
          {
            ticketID, ticketTitle, messageID: message.id, messageDate: message.createdAt, authorID: interaction.user.id
          }
        );
        await client.data.trackers.set(data, guild);
        interaction.reply(
          { content: `New ticket created in #${channel.name} and opened new thread for discussions!`, ephemeral: true }
        );
      }).catch(logger.error);
    };
    async function listTickets() {
      if (data.tickets.length > 0) {
        for (const ticket of data.tickets) {
          let { ticketID, ticketTitle, messageDate } = ticket;
          let author, embed, message;
          try {
            logger.debug(`Fetching message with ID ${ticket.messageID}`);
            author = await client.users.fetch(ticket.authorID);
            message = await channel.messages.fetch(ticket.messageID);
            embed = message.embeds[0];
            if (message) {
              logger.verbose(JSON.stringify(message, null, 2));
              logger.debug(`Found a message with ID ${ticket.messageID}!`);
              ticketListEmbed.addFields({
                name: ticketTitle,
                value: stripIndents`
                  Ticket ID: ${ticketID.substr(0, 8)}
                  Author: ${(author) ? author.tag : 'Unknown#0000'}
                  Opened: ${time(new Date(messageDate))}
                  [Go to ticket](${message.url})`
              });
            } else {
              logger.debug(`No message was found with ID ${ticket.messageID}!`);
              ticketListEmbed.addFields({
                name: `${ticketTitle} [Deleted]`,
                value: stripIndents`
                  Ticket ID: ${ticketID.substr(0, 8)}
                  Author: ${(author) ? author.tag : 'Unknown#0000'}
                  Opened: ${time(new Date(messageDate))}
                  `
              });
            };
          } catch (error) {
            logger.debug('Failed to fetch message details!');
            logger.debug('Maybe message is deleted?');
            logger.error(error.message); logger.debug(error.stack);
            ticketListEmbed.addFields({
              name: `${ticketTitle} [Missing]`,
              value: stripIndents`
                Ticket ID: ${ticketID.substr(0, 8)}
                Author: ${(author) ? author.tag : 'Unknown#0000'}
                Opened: ${time(new Date(messageDate))}
                `
            });
          };
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
    function lockTicket() {
      if (data.tickets.length > 0) {
        for (const ticket of data.tickets) {
          thread = channel.threads.fetch(ticket.messageID);
          if (thread) {
            break;
          };
        };
        // ..
      };
      let message = channel.messages.fetch(messageID);
    };
    switch (subcmd) {
      case 'new':
        createTicket();
        break;
      case 'list':
        listTickets();
        break;
      case 'lock':
        lockTicket();
        break;
      case 'close':
        // closeTicket();
        break;
    }
  }
};