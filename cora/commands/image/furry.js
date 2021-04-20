const { Command } = require('discord.js-commando');
const { MessageEmbed, MessageFlags } = require('discord.js');
const logger = require('../../providers/WinstonPlugin');
const { yiffyApiKey, myUserAgent } = require('../../handlers/bootLoader');
const { stripIndents } = require('common-tags');
const Yiffy = require('yiffy');
const yiffy = new Yiffy({
    userAgent: myUserAgent,
    apiKey: yiffyApiKey
});

module.exports = class FurryCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'furry',
            aliases: ['fur', 'mur'],
            group: 'image',
            memberName: 'furry',
            description: 'Some fun furry images using FurryBotAPI.',
            details: stripIndents`
                Provides a bunch of fun furry images powered by the FurryBotAPI.
                From cheeky licks, cute hugs and cuddles, to the more daring or lustful ones.
                Service provided by DonovanDMC (https://github.com/FurryBotCo/Yiffy)`,
            examples: ['furry <option>'],
            args: [
                {
                    key: 'option',
                    prompt: 'furry.command.prompt.option',
                    default: '',
                    type: 'string'
                }
            ]
        });
    }
    async run(message, args) {
        const { option } = args;

        // Embed Function Handler to format output of furry image command.
        function furEmbed (client, res, isNsfw, title, desc) {
            if (isNsfw == true && !message.channel.nsfw) {
                message.reply("woah there! You can only use those options in NSFW channels!")
                return;
            }
            let artists, sources;
            // FurryBotAPI sometimes gives empty responses for some values, check first before parsing in embed.
            if (res.artists != '') {
                artists = res.artists;
            } else {
                artists = "N/A";
                //logger.debug(`artists = ${artists}`);
            }
            if (res.sources != '') {
                sources = res.sources;
                //logger.debug(`sources = ${sources}`);
            } else {
                sources = "N/A";
            }
            let report = res.reportURL;
            const imageEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(title)
                .setDescription(desc)
                .addFields(
                    {name:'Artists', value:artists},
                    {name:'Sources', value:sources},
                    {name:'Report Content', value:`Is this inappropriate content? Report it at ${report}`}
                )
                .setThumbnail(client.user.avatarURL({format:"png"}))
                .setImage(res.url)
                .setFooter('Bot created and maintained by NovaLynxie. Image provided by Yiffy API.', client.user.avatarURL({format:"png"}))
            return message.channel.send(imageEmbed); // Sends the image embed to the channel the user ran the command.
        }
        // furry command option handler.
        if (option === 'help') {
            logger.debug('Help requested. Sending helpEmbed.')
            const helpEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle('You confused? Here ya go!')
                .setDescription(stripIndents`
                    Here are the subcommands for the \`furry\` command.
                    *NSFW Sub-commands will only work in nsfw marked channels*
                `)
                .addFields(
                    {name:'SFW Image Options', value:'\`boop, howl, hug, flop, hold, cuddle, fursuit, lick\`'},
                    {name:'NSFW Image Options', value:'\`bulge, kiss, yiff, gay, lesbian, shemale\`'}
                )
                .setThumbnail(this.client.user.avatarURL({format:"png"}))
                .setFooter('Bot created and maintained by NovaLynxie. Image provided by Yiffy API.', this.client.user.avatarURL({format:"png"}))
            return message.channel.send(helpEmbed);
        // Safe For Work sub commands, for all furry friends and anyone curious enough to see!
        // Should work for all channels, regardless if marked as NSFW or not.
        } if (option === 'boop') {
            yiffy.furry.boop("json", 1)
                .then(res => {
                    logger.debug('response => yiffy.furry.boop')
                    let isNsfw = false;
                    let title = 'Boop dat snoot! >w<';
                    let desc = `Hehe, its time to boop the snoot.`;
                    furEmbed(this.client, res, isNsfw, title, desc);
                })
            return;
        } if (option === 'howl') {
            yiffy.furry.howl("json", 1)
                .then(res => {
                    logger.debug('response => yiffy.furry.howl')
                    let isNsfw = false;
                    let title = 'Awwooo!';
                    let desc = `Howling at the moon, or whatever I guess.`;
                    furEmbed(this.client, res, isNsfw, title, desc);
                })
            return;
        } if (option === 'hug') {
            yiffy.furry.hug("json", 1)
                .then(res => {
                    logger.debug('response => yiffy.furry.hug')
                    let isNsfw = false;
                    let title = 'Huggy wuggies ^w^';
                    let desc = `Its time for some hugs.`;
                    furEmbed(this.client, res, isNsfw, title, desc);
                })
            return;
        } if (option === 'flop') {
            yiffy.furry.flop("json", 1)
                .then(res => {
                    logger.debug('response => yiffy.furry.flop')
                    let isNsfw = false;
                    let title = 'Furries do the flop?';
                    let desc = `That looks very comfy, maybe I'll also flop on someone too.`;
                    furEmbed(this.client, res, isNsfw, title, desc);
                })
            return;
        } if (option === 'hold') {
            yiffy.furry.hold("json", 1)
                .then(res => {
                    logger.debug('response => yiffy.furry.hold')
                    let isNsfw = false;
                    let title = 'Hold time!';
                    let desc = `Aww, they look soo cute UwU`;
                    furEmbed(this.client, res, isNsfw, title, desc);
                })
            return;
        } if (option === 'cuddle') {
            yiffy.furry.cuddle("json", 1)
                .then(res => {
                    logger.debug('response => yiffy.furry.cuddle')
                    let isNsfw = false;
                    let title = 'Cuddle wuddles!';
                    let desc = `Snuggling up with your loved ones.`;
                    furEmbed(this.client, res, isNsfw, title, desc);
                })
            return;
        } if (option === 'fursuit' || option === 'suit') {
            yiffy.furry.fursuit("json", 1)
                .then(res => {
                    logger.debug('response => yiffy.furry.fursuit')
                    let isNsfw = false;
                    let title = 'Fursuits big and small!';
                            let desc = `Lots of cute and adventurous fursuiters, ya gotta see them all!`;
                    furEmbed(this.client, res, isNsfw, title, desc);
                })
            return;
        // Not Safe For Work sub commands. For those who have deeper, more sensual interests UwU.
        // Will only work in channels marked NSFW which the bot can send to.
        } if (option === 'lick') {
                yiffy.furry.lick("json", 1)
                    .then(res => {
                        logger.debug('response => yiffy.furry.lick')
                        let isNsfw = true;
                        let title = `I'm a lick ya!`;
                        let desc = `N-nyahhh! That tickles x3`;
                        furEmbed(this.client, res, isNsfw, title, desc);
                    })
                return; 
        } if (option === 'bulge') {
            yiffy.furry.bulge("json", 1)
                .then(res => {
                    logger.debug('response => yiffy.furry.bulge')
                    let isNsfw = true;
                    let title = 'Those bulges... OwO';
                    let desc = `I see that bulgy wulgy >w<`;
                    furEmbed(this.client, res, isNsfw, title, desc);
                })
            return;
        } if (option === 'kiss') {
            yiffy.furry.kiss("json", 1)
                .then(res => {
                    logger.debug('response => yiffy.furry.kiss')
                    let isNsfw = true;
                    let title = 'Mwahh! x3';
                    let desc = `Aww... hehe (blushes)`;
                    furEmbed(this.client, res, isNsfw, title, desc);
                })
            return;
        } if (option === 'yiff') {
            yiffy.furry.yiff.straight("json", 1)
                .then(res => {
                    logger.debug('response => yiffy.furry.yiff.straight')
                    let isNsfw = true;
                    let title = 'Y-yiff? O//w//O';
                    let desc = `Hehe, they're going right at it.`;
                    furEmbed(this.client, res, isNsfw, title, desc);
                })
            return;
        } if (option === 'gay') {
            yiffy.furry.yiff.gay("json", 1)
                .then(res => {
                    logger.debug('response => yiffy.furry.yiff.gay')
                    let isNsfw = true;
                    let title = 'Gay bois!';
                    let desc = `Now that is some gay stuff right there.`;
                    furEmbed(this.client, res, isNsfw, title, desc);
                })
            return;
        } if (option === 'lesbian') {
            yiffy.furry.yiff.lesbian("json", 1)
                .then(res => {
                    logger.debug('response => yiffy.furry.yiff.lesbian')
                    let isNsfw = true;
                    let title = 'Girls need love too';
                    let desc = `Wow these girls sure be gay for each other.`;
                    furEmbed(this.client, res, isNsfw, title, desc);
                })
            return;
        } if (option === 'shemale' || option === 'dickgirl' || option === 'gynomorph') {
            yiffy.furry.yiff.gynomorph("json", 1)
                .then(res => {
                    logger.debug('response => yiffy.furry.yiff.gynomorph')
                    let isNsfw = true;
                    let title = 'Girls... with male junk?';
                    let desc = `Them gals sure be showing off their junk.`;
                    furEmbed(this.client, res, isNsfw, title, desc);
                })
            return;
        } else {
            message.reply(stripIndents`
            I could not find that subcommand in this command's database.
            Please check your command input and try again.
            *Use \`p help fur\` for help with this command.*`)
        }
    }
};