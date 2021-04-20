const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
require('moment-duration-format');
const { stripIndents } = require('common-tags');
const { version } = require('../../../package.json')
module.exports = class BotInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'stats',
            aliases: ['uptime'],
            group: 'util',
            memberName: 'botstats',
            description: 'Displays some information about the bot.',
        });
    }
    run(message) {
        var Servers = this.client.guilds.cache.size
        var Channels = this.client.channels.cache.size
        var Users = this.client.users.cache.filter(user => !user.bot).size
        const embed = new MessageEmbed()
            .setTitle("Bot Statistics")
            .setColor(0xE7A3F0)
            .addFields(
                
                {
                    name: '> Total Uptime',
                    value: moment.duration(this.client.uptime)
                            .format('d[ days], h[ hours], m[ minutes ]s[ seconds]'),
                    inline: true
                },
                {
                    name: '> Memory Usage',
                    value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
                },
                {
                    name: '> General Stats',
                    value: stripIndents`
                    Guilds: ${Servers} servers
                    Channels: ${Channels} channels
                    Users: ${Users} users
                    `
                },
                {
                    name: '> Version',
                    value: `v${version}`,
                    inline: true
                }
            )
            .setThumbnail(this.client.user.displayAvatarURL({ formant: 'png'}))
        return message.embed(embed);
    }
};
