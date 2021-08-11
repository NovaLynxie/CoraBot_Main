const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const moment = require('moment');
//const username = require('../../proto_modules/models/Username');

module.exports = class UserInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'userinfo',
            group: 'info',
            aliases: ['whois'],
            memberName: 'userinfo',
            description: 'Gets information about a user.',
            details: `Allows you to get detailed information on the specified user.`,
            guildOnly: true,
            throttling: {
                usages: 3,
                duration: 3
            },
            args: [
                {
                    key: 'user',
                    prompt: 'who would you like information about?',
                    type: 'user',
                }
            ]
        });
    }
    async run(message, {user}) {
        const member = await message.guild.members.fetch(user.id)
        const defaultRole = message.guild.roles.cache.get(message.guild.id);
        const roles = member.roles.cache   
            .filter( role => role.id !== defaultRole.id)
            .sort((a, b) => b.position - a.position)
            .map(role => role.name)
        const userInfo = new MessageEmbed()
            .setTitle('User Information')
            .setColor(0xE7A3F0)
            .setDescription('Provides detailed information about any users in a guild.')
            .addFields(
                {
                    name: '> Member Information',
                    value: stripIndents`
                            Username: ${user.username}#${user.discriminator}
                            Nickname: ${member.nickname ? member.nickname : "N/A"}
                            Joined: ${moment.utc(member.joinedTimestamp).format('dddd, MMMM Do YYYY, HH:mm:ss Z')}
                            Roles: ${roles.length}
                            (${roles.length ? roles.join(', ') : "None"})
                    `
                },
                {
                    name: '> User Information',
                    value: stripIndents`
                            Bot Acc: ${user.bot}
                            Created: ${moment.utc(user.createdAt).format('dddd, MMMM Do YYYY, HH:mm:ss Z')}
                            Status: ${user.presence.status}
                            Game: ${user.presence.game ? user.presence.game.name : 'None'}

                    `
                }
            )
            .setThumbnail(user.displayAvatarURL({ format: 'png' }))
        return message.embed(userInfo)
    }
};
