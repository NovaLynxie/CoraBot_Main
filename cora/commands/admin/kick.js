const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const getLocalTime = require('../../handlers/serverRegion');
module.exports = class KickCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'kick',
            group: 'admin',
            memberName: 'kick',
            aliases: ['boot'],
            description: 'Kicks guild member out of this server.',
            details: 'Kicks the mentioned guild member out of this server.',
            examples: ['kick <@user>'],
            clientPermissions: ['KICK_MEMBERS'],
            userPermissions: ['KICK_MEMBERS'],
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 3,
            },
            args: [
                {
                    key: 'user',
                    prompt: 'Tell me the user to kick out',
                    type: 'user'
                },
                {
                    key: 'reason',
                    prompt: 'Any reasons for them to be kicked out?',
                    type: 'string',
                    default: 'No reason provided.'
                }
            ]
        })
    }
    run(message, { user, reason}) {
        var channel = message.guild.channels.cache.find(ch => ch.name === 'moderation-log')
        try {
            if (!channel) {
                message.say(stripIndents`
                Whoops! 🙀
                I'm missing a moderations log channel or cannot find it, unable to log moderation actions.
                Please contact my owner or higher ups immediately as as I cannot log mod actions without one!
                \`\`\`Error! Missing channel/permissions for channel #moderation-log\`\`\`
                `)
                console.log('[Error] Missing channel or permissions invalid! Unable to log suggestion!')
                console.log('[Warn] Moderation action has not been saved correctly, check error message.')
                return
            }
            if (!user) {
                message.reply(stripIndents`
                you didn't mention anyone to kick! Please check your spelling and try again.
                `)
                console.log(`[Warn] Missing args! No user mentioned, aborting command.`)
                return
            }
            if (!user.kickable) {
                message.reply(stripIndents`
                I'm sorry but I am unable to kick this user. May be missing permissions or their permission level is higher than mine.
                `)
                console.log(`[Warn] Unable to kick user, possibly permission error or my permission level is too low.`)
                return
            }
            var logColor = 0xDC9934
            var operator = message.author
            var nick = message.guild.members.fetch(user.id)
            var date = getLocalTime(message)
            var logEmbed = new MessageEmbed()
                .setColor(logColor)
                .setTitle('They were kicked out.')
                .setAuthor(moderator.username+'#'+moderator.discriminator, moderator.avatarURL)
                .addFields(
                    {
                        name: `> User Info`,
                        value: stripIndents`
                                **Username:** ${user}
                                **Nickname:** ${nick}
                                **Log Date:** ${date}
                        `
                    },
                    {
                        name: `> Details on Kick`,
                        value: stripIndents`
                                Kicked by ${operator.username}#${operator.discriminator}
                                For ${reason ? reason : "No reason given"}.
                        `
                    }
                )
                .setThumbnail(user.displayAvatarURL({format:'png'}))
                .setFooter(`Moderation logged by Cora`)
            channel.send(logEmbed);
            return member
                .kick('You have been kicked by an administrator.')
                .then(() => message.reply(`${member.user.tag} has been kicked from the server.`))
                .catch(error => {
                    console.error(error);
                message.reply('An error occured, please try again.')
                });
        } catch (err) {
            console.log(`[Severe] Exception Error! An error has occured in the kick command!`)
            message.say(`An error occured while running this command, please try again.`)
            return console.error(err);
        }
    }
};