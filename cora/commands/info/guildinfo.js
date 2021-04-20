const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const { stripIndents } = require('common-tags');

const humanLevels = {
    0: 'None',
    1: 'Low',
    2: 'Medium',
    3: 'High', //'(╯°□°）╯︵ ┻━┻',
    4: 'Maxmimum' //'┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
};

module.exports = class GuildInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'guildinfo',
            aliases: ['server','guild','whereami'],
            group: 'info',
            memberName: 'guildinfo',
            description: 'Get info on the server.',
            details: `Get detailed information on the server.`,
            guildOnly: true,
            throttling: {
                usages: 2,
                duration: 3
            }
        });
    }
    run(message) {
        //Debug console log parts, uncomment when needed.
        //console.log(message.guild);
        //console.log(message.guild.channels);
        //console.log(message.guild.channels.cache.size);
        //message.say(message.guild.channels.cache.size);
        //console.log(message.guild.roles.cache.size);
        //message.say(message.guild.roles.cache.size);
        //message.say('Printing information');
        const verifGetLvl = message.guild.verificationLevel;
        try {
            if (verifGetLvl === 'NONE') {
                var verifLevel = 0;
            } else if (verifGetLvl === 'LOW') {
                var verifLevel = 1;
            } else if (verifGetLvl === 'MEDIUM') {
                var verifLevel = 2;
            } else if (verifGetLvl === 'HIGH') {
                var verifLevel = 3;
            } else if (verifGetLvl === 'VERY_HIGH') {
                var verifLevel = 4;
            } //return verifLevel
        } catch (err) {
            console.log('[Error] Security status missing or undefined! This should not happen.')
            console.log(err);
        }
        
        var TxtChannels = message.guild.channels.cache.filter(ch => ch.type === 'text').size
        var VcChannels = message.guild.channels.cache.filter(ch => ch.type === 'voice').size
        var AfkChannels = message.guild.afkChannelID ? `<#${message.guild.afkChannelID}> after ${message.guild.afkTimeout / 60}min` : 'None Set'
        var GuildUsers = message.guild.members.cache.filter(m => !m.user.bot).size
        var GuildBots = message.guild.members.cache.filter(m => m.user.bot).size

        const serverinfo = new MessageEmbed()
            .setTitle("Server Information")
            .setColor(0xE7A3F0)
            .setDescription('Provides detailed information about any discord server/guild.')
            .addFields(
                {
                    name: '> Channels',
                    value: stripIndents`
                            - Text: ${TxtChannels} channels
                            - Voice: ${VcChannels} channels
                            - AFK: ${AfkChannels}
                    `
                },
                {
                    name: '> Members',
                    value: stripIndents`
                            - Owner: ${message.guild.owner.user.tag}
                            (OwnerID: ${message.guild.ownerID})
                            - Users: ${GuildUsers} users
                            - Bots: ${GuildBots} bots
                    `
                },
                {
                    name: '> Extra Info',
                    value: stripIndents`
                            - Roles: ${message.guild.roles.cache.size} roles
                            - Region: ${message.guild.region}
                            - Created: ${moment.utc(message.guild.createdAt).format('dddd, MMMM Do YYYY, HH:mm:ss Z')}
                            - Verif. Lvl: ${humanLevels[verifLevel]}
                    `
                }
            )
            .setThumbnail(message.guild.iconURL({ format: 'png' }));
        return message.embed(serverinfo);
    }
};
