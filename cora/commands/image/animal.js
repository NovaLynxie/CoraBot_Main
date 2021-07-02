const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const logger = require('../../providers/WinstonPlugin');
const { stripIndents } = require('common-tags');
const {cheweyApiToken} = process.env;
const cheweyBot = require('cheweybot-api');
let status = 0;
try {
  logger.data(cheweyApiToken);
  cheweyBot.init(cheweyApiToken);
  status = 0;
} catch (err) {
  logger.error('Failed to initialize cheweyBot handler!');
  logger.error(err); logger.debug(err.stack);
  logger.warn('The command animal.js disabled to prevent crash.');
  status = -1;
}

module.exports = class AnimalsCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'animal',
            group: 'image',
            memberName: 'animal',
            description: 'Some fun furry images using CheweyBotAPI.',
            details: stripIndents`
                This command provides a bunch of cute and adorable animal images.
                From our feathered birds, cute bleps, to the wild animals such as foxes and wolves. 
                Service provided by CheweyBotAPI, please **do not** abuse this command.`,
            examples: ['animal <option>'],
            throttling: {
                usages: 1,
                duration: 3
            },
            args: [
                {
                    key: 'option',
                    prompt: 'animal.command.prompt.option',
                    default: '',
                    type: 'string'
                }
            ]
        });
    }
    async run(message, args) {
        const { option } = args;
        if (status === -1) return message.reply("I'm sorry but there was an error starting up the cheweyApi handler. This command has been disabled to prevent bot crashes.");
        // Embed Function Handler to format output of furry image command.
        function imgEmbed (client, url) {
            const imageEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('Animal Handler v2')
                .setImage(url)
                .setFooter('Bot created and maintained by NovaLynxie. Image provided by CheweyBotAPI.', client.user.displayAvatarURL({ format: 'png'}))
            return message.channel.send(imageEmbed); // Sends the image embed to the channel the user ran the command.
        }
        // animal command option handler. (MAY REWRITE OPTION CALLS IF API MODULE IS CHANGED!)
        if (option === 'help') {
            const helpEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('You confused? Here ya go!')
                .setDescription(stripIndents`
                    Here are the subcommands for the \`animal\` command.
                `)
                .addField(
                    {name:'Animal Options', value:'\`bird/birb, blep, cheeta, fox, lynx, wolf\`'}
                )
                .setThumbnail(this.client.user.avatarURL({format:"png"}))
                .setFooter('Bot created and maintained by NovaLynxie. Image provided by CheweyBotAPI.', this.client.user.avatarURL({format:"png"}))
            return message.channel.send(helpEmbed);
        } if (option === 'bird' || option === 'birb') {
            logger.debug(`opthandler -> option=${option}`)
            cheweyBot.get("birb").then((reply)=>{
                imgEmbed(this.client, reply.data)
            });
            return;
        } if (option === 'cat') {
            logger.debug(`opthandler -> option=${option}`)
            cheweyBot.get("cat").then((reply)=>{
                imgEmbed(this.client, reply.data)
            });
            return;
        } if (option === 'dog') {
            logger.debug(`opthandler -> option=${option}`)
            cheweyBot.get("dog").then((reply)=>{
                imgEmbed(this.client, reply.data)
            });
            return;
        } if (option === 'duck') {
            logger.debug(`opthandler -> option=${option}`)
            cheweyBot.get("duck").then((reply)=>{
                imgEmbed(this.client, reply.data)
            });
            return;
        } if (option === 'fox') {
            logger.debug(`opthandler -> option=${option}`)
            cheweyBot.get("fox").then((reply)=>{
                imgEmbed(this.client, reply.data)
            });
            return;
        } if (option === 'koala') {
            logger.debug(`opthandler -> option=${option}`)
            cheweyBot.get("koala").then((reply)=>{
                imgEmbed(this.client, reply.data)
            });
            return;
        } if (option === 'otter') {
            logger.debug(`opthandler -> option=${option}`)
            cheweyBot.get("otter").then((reply)=>{
                imgEmbed(this.client, reply.data)
            });
            return;
        } if (option === 'owl') {
            logger.debug(`opthandler -> option=${option}`)
            cheweyBot.get("owl").then((reply)=>{
                imgEmbed(this.client, reply.data)
            });
            return;
        } if (option === 'panda') {
            logger.debug(`opthandler -> option=${option}`)
            cheweyBot.get("panda").then((reply)=>{
                imgEmbed(this.client, reply.data)
            });
            return;
        } if (option === 'rabbit') {
            logger.debug(`opthandler -> option=${option}`)
            cheweyBot.get("rabbit").then((reply)=>{
                imgEmbed(this.client, reply.data)
            });
            return;
        } if (option === 'redpanda') {
            logger.debug(`opthandler -> option=${option}`)
            cheweyBot.get("red-panda").then((reply)=>{
                imgEmbed(this.client, reply.data)
            });
            return;
        } if (option === 'snake') {
            logger.debug(`opthandler -> option=${option}`)
            cheweyBot.get("snake").then((reply)=>{
                imgEmbed(this.client, reply.data)
            });
            return;
        } if (option === 'turtle') {
            logger.debug(`opthandler -> option=${option}`)
            cheweyBot.get("turtle").then((reply)=>{
                imgEmbed(this.client, reply.data)
            });
            return;
        } if (option === 'wolf') {
            logger.debug(`opthandler -> option=${option}`)
            cheweyBot.get("wolf").then((reply)=>{
                imgEmbed(this.client, reply.data)
            });
            return;
        } else {
            message.reply(stripIndents`
            I'm sorry, but that option does not exist.
            Please check your command input and try again.
            *Use \`c help animal\` for help with this command.*`)
        }
    }
};