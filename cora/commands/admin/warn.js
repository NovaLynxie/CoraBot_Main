const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const getLocalTime = require('../../handlers/serverRegion');
module.exports = class WarnCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'warn',
            group: 'admin',
            memberName: 'warn',
            aliases: ['tell'],
            description: 'Warns guild member in this server.',
            details: `Warns the mentioned guild member in the server with an optional reason.`,
            examples: ['warn <@user> <reason>'],
            clientPermissions : ['MANAGE_ROLES'],
            userPermissions: ['SEND_MESSAGES', 'MANAGE_MESSAGES'],
            guildOnly: true,
            throttling: {
				usages: 1,
				duration: 3
			},
			args: [
                {
                    key: 'user',
                    prompt: 'Tell me the user to warn.',
                    type: 'user',
                    default: ''
                },
                {
                    key: 'reason',
                    prompt: 'Any reasons for the warning?',
                    type: 'string',
                    default: ''
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
                you didn't mention anyone to warn! Please check your spelling and try again.`)
                console.log(`[Warn] Missing args! No user mentioned, aborting command.`)
                return
            }
            var logColor = 0xDC9934
            var operator = message.author
            var member = message.guild.members.cache.find(n => n.id == user.id);
            var name = member.user.username+'(#'+member.user.discriminator+')';
            var nick = member.nickname;
            var date = getLocalTime(message)
            var logEmbed = new MessageEmbed()
                .setColor(logColor)
                .setTitle(`Warning Issued`)
                .addFields(
                    {
                        name: `> User Info`,
                        value: stripIndents`
                                **Username:** ${name}
                                **Nickname:** ${nick}
                                **Log Date:** ${date}
                        `
                    },
                    {
                        name: `> Details for Warn`,
                        value: stripIndents`
                                Warned by ${operator.username}#${operator.discriminator}
                                Reason: ${reason ? reason : "No reason given"}.
                        `
                    }
                )
                .setThumbnail(message.author.displayAvatarURL({format:'png'}))
                .setFooter(`Moderation logged by Cora`)
            return channel.send(logEmbed);
        } catch (err) {
            console.log(`[Severe] Exception Error! An error has occured in the warn command!`)
            message.say(`An error occured while running this command, please try again.`)
            return console.error(err);
        }
        
    }
};