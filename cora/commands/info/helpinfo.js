const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { stripIndents, oneLine } = require('common-tags');
const logger = require('../../providers/WinstonPlugin');

module.exports = class helpDescCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'help', //May conflict with built-in if enabled. 
            aliases: ['ask','cmds','h'],
            group: 'info',
            memberName: 'helpinfo',
            description: 'Shows help to the user.',
            guildOnly: false,
            args: [
                {
                    key: 'command',
                    prompt: 'help.command.prompt_message',
                    type: 'string',
                    default: ''
                }
            ]
        })
    }
    async run(message, args) {
        function disambiguate(items, label, property = 'name') {
            const itemList = items.map(item => `"${(property ? item[property] : item).replace(/ /g, '\xa0')}"`).join(',   ');
            return `Multiple ${label} found, please be more specific: ${itemList}`;
        }
        const groups = this.client.registry.groups;
        const commands = this.client.registry.findCommands(args.command, false, message);
        const showAll = args.command && args.command.toLowerCase() === 'all';
        
        if(!args.command) {
            var helpEmbed = new MessageEmbed()
                .setTitle("Help Information")
                .setColor(0xE7A3F0)
                .setDescription(stripIndents`
                    Looking for a command?
                    \`\`\`Usage ${this.client.commandPrefix} help <command/all>\`\`\`
                    `)
                .setFooter("Built on Node.js using Discord.js with Commando.")
                .setThumbnail(this.client.user.displayAvatarURL({ format: 'png'}))
            return message.channel.send(helpEmbed)
        }
        if(args.command && !showAll) {
            logger.debug(`Looking for ${args.command} in commands...`)
            if(commands.length === 1){
                let helpDesc = stripIndents`
                    ${oneLine`
                        __Command **${commands[0].name}**:__ 
                        ${commands[0].description}
                        ${commands[0].guildOnly ? ' (Usable only in servers)' : ''}
                        ${commands[0].nsfw ? ' (NSFW) ' : ''}
                    `}

                    **Format:** ${message.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}`: ''}`)}
                `;
                if (commands[0].aliases.length > 0) helpDesc += `\n**Aliases:** ${commands[0].aliases.join(', ')}`;
                helpDesc += `\n${oneLine`
                    **Group:** ${commands[0].group.name}
                    (\`${commands[0].groupID}:${commands[0].memberName}\`)
                `}`
                if(commands[0].details) helpDesc += `\n**Details:** ${commands[0].details}`;
                if(commands[0].examples) helpDesc += `\n**Examples:**\n${commands[0].examples.join('\n')}`;

                try {
                    var helpEmbed = new MessageEmbed()
                        .setTitle("Help Information")
                        .setColor(0xE7A3F0)
                        .setDescription(stripIndents`
                            Here is the details on the command you requested help for.`
                        )
                        .addFields(
                            {
                                name: `Command Help`,
                                value: helpDesc
                            }
                        )
                        .setFooter("Built on Node.js using Discord.js with Commando.")
                        .setThumbnail(this.client.user.displayAvatarURL({ format: 'png'}))
                    return message.channel.send(helpEmbed)
                } catch (err) {
                    message.reply(stripIndents`
                    I was unable to find any command matching your help query in my database.
                    Please check your spelling and try again.`)
                    logger.error(`Unable to find command match. Aborting command search.`)
                }
            } else if(commands.length > 15) {
                logger.warn('More than 15 commands were found! Request must be more specific.')
                message.reply('Multiple commands found! Please be more specific.')
                return; 
            } else if(commands.length > 1) {
                logger.warn('Disambiguation is required, alerting user.')
                message.reply(disambiguate(commands, 'commands'))
                return;
            } else {
                try {
                    logger.warn('Cannot find that command. Either it does not exist or is not loaded.')
                    var helpEmbed = new MessageEmbed()
                        .setTitle("Help Information")
                        .setColor(0xE7A3F0)
                        .setDescription(stripIndents`
                        I'm sorry, but your query does not match any commands in my database.
                        Please check your spelling and try again.`)
                        .setFooter("Built on Node.js using Discord.js with Commando.")
                        .setThumbnail(this.client.user.displayAvatarURL({ format: 'png'}))
                    return message.channel.send(helpEmbed)
                } catch (err) {
                    logger.error(err)
                }
            }
        } else {

            const allCmds = (`${groups.filter(grp => grp.commands.some(cmd => !cmd.hidden && (showAll || cmd.isUsable(message))))
                .map(grp => stripIndents`
                    __${grp.name}__
                    ${grp.commands.filter(cmd => !cmd.hidden && (showAll || cmd.isUsable(message)))
                        .map(cmd => `**${cmd.name}**`).join(', ')
                    }
                `).join('\n\n')
            }`)

            try {
                var helpEmbed = new MessageEmbed()
                    .setTitle("Help Information")
                    .setColor(0xE7A3F0)
                    .setDescription(stripIndents`
                        Here is all the commands that are available to the user.
                        Some commands are Guild Only while some require NSFW channels to run.
                        To get more information on a specific command use:
                        \`${this.client.commandPrefix} help <command>\``
                    )
                    .addFields(
                        {
                            name: `__**Commands**__`,
                            value: allCmds
                        }
                    )
                    .setFooter("Built on Node.js using Discord.js with Commando.")
                    .setThumbnail(this.client.user.displayAvatarURL({ format: 'png'}))
                return message.channel.send(helpEmbed);
            } catch (err) {
                message.say(stripIndents`
                Whoops! Something went wrong during evaluating this request.
                Please contact my owner immediately as this should not happen!
                \`Error! Invalid Response or Evaluation failed!\``)
                logger.error('Uh oh! Something has gone wrong during processing the request.')
                logger.warn('If you see this message in console with nothing in discord chat, then something has gone wrong.')
            }
        }
    }
}