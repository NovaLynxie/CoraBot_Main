const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const modlogs = require('../../modules/modLogger');
const getLocalTime = require('../../handlers/serverRegion');
module.exports = class BanCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'ban',
            group: 'admin',
            memberName: 'ban',
            aliases: ['exile'],
            description: 'Bans guild member from this server.',
            details: 'Bans the mentioned guild member from this server.',
            examples: ['ban <@user> [reason]'],
            clientPermissions: ['BAN_MEMBERS'],
            userPermissions: ['BAN_MEMBERS'],
            guildOnly: true,
            throttling: {
                usages: 1,
                duration: 3,
            },
            args: [
                {
                    key: 'user',
                    prompt: 'Tell me the user to use the ban hammer on.',
                    type: 'user'
                },
                {
                    key: 'reason',
                    prompt: 'Any reasons for their ban?',
                    type: 'string',
                    default: 'No reason provided.'
                }
            ]
        })
    }
    run(message, { user, reason }) {
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
                you didn't mention anyone to ban! Please check your spelling and try again.`)
                console.log(`[Warn] Missing args! No user mentioned, aborting command.`)
                return
            }
            if (!user.bannable) {
                message.reply(stripIndents`
                I'm sorry but I am unable to ban this user. May be missing permissions or their permission level is higher than mine.`)
                console.log(`[Warn] Unable to kick user, possibly permission error or my permission level is too low.`)
                return
            }
            let action = 'ban';
            //modlogs(action, message, user, reason, this.client); 
            //modLogger not ready yet. disabled this till it is working.
            var logColor = 0xDC9934
            var operator = message.author.username+'#'+message.author.discriminator
            var nick = message.guild.members.fetch(user.id)
            var date = getLocalTime(message)
            var logEmbed = new MessageEmbed()
                .setColor(logColor)
                .setTitle('The ban hammer has spoken')
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
                        name: `> Details for Ban`,
                        value: stripIndents`
                                Banned by ${operator}
                                For ${reason ? reason : "No reason given"}.
                        `
                    }
                )
                .setThumbnail(user.displayAvatarURL({format:'png'}))
                .setFooter(`Moderation logged by Cora`)
            channel.send(logEmbed);
            return member
                .ban('You have been banned by an administrator.')
                .then(() => message.reply(`${member.user.tag} was banned.`))
                .catch(error => {
                    message.reply('An error occured while attempting to ban user, please try again.')
                    console.error(error);
            });
        } catch (err) {
            console.log(`[Severe] Exception Error! An error has occured in the ban command!`)
            message.say(`An error occured while running this command, please try again.`)
            return console.error(err);
        }
        
    }
};