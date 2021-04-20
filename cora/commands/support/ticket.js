const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const fs = require('fs');
// Getting other plugins and functions here.
const logger = require('../../providers/WinstonPlugin');
const getLocalTime = require('../../handlers/serverRegion');
module.exports = class TicketCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ticket',
            group: 'support',
            memberName: 'ticket',
            description: 'Opens a ticket for staff support.',
            details: `For users to open a ticket to request support from server staff.`,
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 5
            },
            args: [
                {
                    key: 'option',
                    prompt: 'ticket.option.prompt_message',
                    type: 'string',
                    default: ''
                },
                {
                    key: 'reason',
                    prompt: 'ticket.reason.prompt_message',
                    type: 'string',
                    default: ''
                }
            ]
        });
    }
    async run(message, { option, reason }) {
        let guild = message.guild;
        let bot = this.client;
        var channel = message.channel;
        var user = message.author;
        var member = guild.member(user.id);
        var staff = guild.roles.cache.find(r => r.name.toLowerCase() === 'staff');
        var tickets = guild.channels.cache.find(ch => ch.name.toLowerCase() === 'tickets' && ch.type === 'category');
        
        if (!option) {
            message.delete({ timeout: 1000, reason: 'Keeping the channel clean.' });
            const ticketHelp = new MessageEmbed()
                .setTitle('Tickets Help')
                .setColor(0xF6CEEC)
                .addField('Did you mean to open a ticket?', 'Usage: `ticket <new>`')
                .setFooter('Tickets v1.0-dev created by NovaLynxie#9765 originally for SquishBot');
            message.channel.send(ticketHelp);
        }
        if (option == 'new') {
            message.delete({ timeout: 1000, reason: 'Keeping the channel clean.' });
            if(message.guild.channels.cache.some(ch => ch.name.toLowerCase() === 'ticket-' + message.author.username)) {
                message.reply("you still have an open ticket! Please close the old ticket before opening a new one.");
                logger.warn(`User ${message.author.tag} still has a ticket open! Aborting ticket creation.`);
            } else {
                guild.channels.create(`ticket-${user.id}`, {
                //guild.createChannel(`ticket-${user.username}`, {
                    type: 'text',
                    topic: reason ? reason : 'None specified',
                    permissionOverwrites: 
                        [
                            {
                                allow: ['VIEW_CHANNEL','SEND_MESSAGES','ATTACH_FILES'],
                                id: message.author.id
                                // Allows the user to view and send messages in the ticket channel.
                            },
                            {
                                allow: ['VIEW_CHANNEL','SEND_MESSAGES','MANAGE_CHANNELS'],
                                id: bot.user.id
                                // Allows the bot to view and manage the ticket channel.
                            },
                            {
                                deny: ['VIEW_CHANNEL','SEND_MESSAGES'],
                                id: guild.id
                                // Hides the ticket channel from everyone else after it's created.
                            },
                            {
                                allow: ['VIEW_CHANNEL','SEND_MESSAGES'],
                                id: staff.id
                                // Allows the ticket support staff to see the ticket channel and send messages.
                            }
                        ]
                }).then(ch => {
                    ch.setParent(tickets.id); //Sets parent (category) to tickets category.
                    logger.info(`Opened ${ch.name} successfully!`);
                    ch.send(stripIndents`
                    ${member.user}, your ticket is now open! Our ${staff} will respond shortly.
                    **Explain your issue in full detail!** Please include any logs, crash reports, or screenshots that may support your issue.
                    *If you are having trouble finding these files, click on 'modpack options' and press 'open' where it states the folder location.*`);
                }).catch(err => {
                    message.reply(stripIndents`
                    I cannot find the tickets category or missing tickets category!
                    Please contact a staff member for assistance.`)
                    logger.error(`Permission Error! Failed to open the ticket channel for ${message.author.username}!`)
                    logger.error(err)
                });
            }
        }
        
        if (option == 'close') {
            logger.info(`Closing ticket channel...`)
            if (channel.name.slice(0,7) != 'ticket-') {
                message.reply('This can only be run in the ticket channel!');
                logger.warn(`Channel is not a ticket! Aborting command.`);
                return message.delete({ timeout: 1000, reason: 'Keeping the channel clean.' });
            }
            if (member.roles.cache.has(staff.id)) {
                channel.send("Closing ticket.")
                channel.delete('Closing ticket')
                    .then(ch => logger.info(`Closed ${ch.name}.`))
                    .catch(err => logger.error(err));
            } else {
                channel = guild.channels.find(ch => ch.name == `ticket-${user.id}`)
                channel.send("Closing ticket.")
                channel.delete('Closing ticket')
                    .then(ch => logger.info(`Closed ${ch.name}.`))
                    .catch(err => logger.error(err));
            }
        };
    }
};