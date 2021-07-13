const { Command } = require('discord.js-commando');
const { MessageEmbed, MessageFlags } = require('discord.js');
const logger = require('../../providers/WinstonPlugin');
const { stripIndents } = require('common-tags');
const fetch = require('node-fetch');
const yiff = require('yiff'); 
const { eImg } = require('../../handlers/bootLoader');
const e9 = new yiff.e926(eImg);

module.exports = class FurryCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'e926',
            aliases: ['e9'],
            group: 'image',
            memberName: 'e926',
            description: 'Gets images from e926 using your tags.',
            details: ` VERY WIP! MAY BREAK AT ANY TIME!
            This command allows users to get images from e926, just input your tags and it will search e926 for you
            *We are not responsible for the image results that come up from your tags, you have been warned.*`,
            examples: ['e926 search <tags>'],
            args: [
                {
                    key: 'option',
                    prompt: 'e926.command.prompt.option',
                    default: '',
                    type: 'string'
                },
                {
                    key: 'tags',
                    prompt: 'e926.command.prompt.tags',
                    default: '',
                    type: 'string'
                }
            ]
        });
    }
    async run(message, args) {
        const { option, tags } = args;

        // Embed Function Handler to format output of furry image command.
        function imgEmbed (client, res, title, desc) {
            if (!message.channel.nsfw) {
                message.reply("woah there! You can only use those options in NSFW channels!")
                return;
            }
            let artist, sources;
            // FurryBotAPI sometimes gives empty responses for some values, check first before parsing in embed.
            if (res.tags.artist != '') {
                artist = res.tags.artist; // Artists are stored in 'tags' so use res.tags instead.
            } else {
                artist = "N/A";
            }
            if (res.sources != '') {
                sources = res.sources;
            } else {
                sources = "N/A";
            }
            const imageEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(title)
                .setDescription(desc)
                .addFields(
                    {name:'Page URL', value:res.page},
                    {name:'Artist', value:artist},
                    {name:'Sources', value:sources}
                )
                .setThumbnail(client.user.avatarURL({format:"png"}))
                .setImage(res.image)
                .setFooter('Bot created and maintained by NovaLynxie. Image provided by e926.', client.user.avatarURL({format:"png"}))
            return message.channel.send(imageEmbed); // Sends the image embed to the channel the user ran the command.
        }
        // furry command option handler.
        if (option === 'help') {
            logger.debug(`Sending help embed to user's channel.`)
            const helpEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('You confused? Here ya go!')
                .setDescription(stripIndents`
                    To start a search, use \`e621 search\` then type in your tags.
                    For multiple word tags use underscore \`_\` between each word like so: \`multi_tag_word\`
                `)
                .setThumbnail(this.client.user.avatarURL({format:"png"}))
                .setFooter('Bot created and maintained by NovaLynxie. Image provided by e926 API.', this.client.user.avatarURL({format:"png"}))
            return message.channel.send(helpEmbed);
        } if (option === 'search') {
            logger.debug('Requesting image from user defined tags.');
            e9.request(tags).then(res => {
                logger.debug('Received  response! Parsing data into embed.');
                let title = 'e926 Image Handler v1.0';
                let desc = `You searched: ${tags}`;
                imgEmbed(this.client, res, title, desc);
                logger.debug('Embed sent to user channel.');
            }).catch(err => {
                logger.error('Whoops! An error occured.');
                logger.error(err);
            });
            logger.debug('Request from user has been sent.')
        } else {
            message.reply(stripIndents`
            I could not find that subcommand in this command's database.
            Please check your command input and try again.
            *Use \`p help fur\` for help with this command.*`)
        }
    }
};