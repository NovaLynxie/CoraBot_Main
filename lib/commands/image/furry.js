const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../../utils/winstonLogger');
const { credentials } = require('../../handlers/bootLoader');
const { yiffyApiKey, userAgent } = credentials;
const { stripIndents } = require('common-tags');
const Yiffy = require('yiffy');
const yiffy = new Yiffy({
  userAgent: userAgent,
  apiKey: yiffyApiKey
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('furry')
    .setDescription('Fetches furry images and displays them back to the user.')
    .addStringOption(option =>
      option
        .setName('option')
        .setDescription('Which type of furry would you like to see?')
        .setRequired(true)
        // safe-for-work options
        .addChoice('boop', 'boop')
        .addChoice('cuddle', 'cuddle')
        .addChoice('flop', 'flop')
        .addChoice('fursuit', 'fursuit')
        .addChoice('howl', 'howl')
        .addChoice('hug', 'hug')
        .addChoice('hold', 'hold')
        // not-safe-for-work options
        .addChoice('lick', 'lick')
        .addChoice('buldge', 'buldge')
        .addChoice('kiss', 'kiss')
        .addChoice('yiff', 'yiff')
        .addChoice('gay', 'gay')
        .addChoice('lesbian', 'lesbian')
        .addChoice('shemale', 'gynomorph')
    ),
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: false });
    const option = interaction.options.getString('option');
    let isNsfw, title, desc;
    logger.verbose(`option=${option}`);
    function generateEmbed (data, opts = {}) {
      logger.verbose(JSON.stringify(data, null, 2));
      let artists = (data.artists !== "") ? data.artists.join(', ') : 'N/A';
      let sources = (data.sources !== "") ? data.sources.join('\n') : 'N/A';
      let reports = data.reportURL;
      const imageEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`${opts.title} - Furry`)
        .setDescription(opts.desc)
        .addFields(
            { 
              name:'Artists', value:(artists !== '') ? artists : 'N/A'
            },
            {
              name:'Sources', value:(sources !== '') ? sources : 'N/A'
            },
            {
              name:'Report Content', value:`Is this inappropriate content? Report it [here](${reports})!`
            }
        )
        .setThumbnail(client.user.avatarURL({format:"png"}))
        .setImage(data.yiffMediaURL)
        .setFooter({
          text: 'Bot created and maintained by NovaLynxie. Powered by Yiffy API', iconURL: client.user.displayAvatarURL({ format: 'png' })
        });
      return interaction.editReply({ embeds: [imageEmbed] });
    };
    function getFurryImg (endpoint) {
      if (isNsfw) {
        if (!interaction.channel.nsfw) return interaction.reply({
          content: 'NSFW content not allowed in channels not marked as NSFW! Try again in a different channel or enable NSFW for this channel first.'
        });
        logger.debug(`response => yiffy.furry.yiff.${endpoint}("json", 1)`);
        try {
          yiffy.furry.yiff[endpoint]("json", 1).then(res => generateEmbed(res, { title, desc }));
        } catch (err) {
          logger.error(err.message); logger.debug(err.stack);
          interaction.editReply({
            content: 'Failed to fetch image from endpoint!',
            ephemeral: true
          });
        };        
      } else {
        logger.debug(`response => yiffy.furry.${endpoint}("json", 1)`);
        try {
          yiffy.furry[endpoint]("json", 1).then(res => generateEmbed(res, { title, desc }));
        } catch (err) {
          logger.error(err.message); logger.debug(err.stack);
          interaction.reply({
            content: 'Failed to fetch image from endpoint!',
            ephemeral: true
          });
        };        
      };
    };
    try {
      switch (option) {
        // sfw options
        case 'boop':
          isNsfw = false;
          title = 'Boop dat snoot! >w<';
          desc = 'Hehe, its time to boop the snoot.';
          getFurryImg(option);
          break;
        case 'cuddle':
          isNsfw = false;
          title = 'Cuddle wuddles!';
          desc = 'Snuggling up with your loved ones.';
          getFurryImg(option);
          break;
        case 'flop':
          isNsfw = false;
          title = 'Furries do the flop?';
          desc = "That looks very comfy, maybe I'll also flop on someone too.";
          getFurryImg(option);
          break;
        case 'hold':
          isNsfw = false;
          title = "Hold time!";
          desc = "Aww, they look soo cute UwU";
          getFurryImg(option);
          break;
        case 'hug':
          isNsfw = false;
          title = "Huggy wuggies ^w^";
          desc = "Its time for some hugs.";
          getFurryImg(option);
          break;
        case 'howl':
          isNsfw = false;
          title = 'Awwooo!';
          desc = "Howling at the moon, or whatever I guess.";
          getFurryImg(option);
          break;
        case 'fursuit':
          isNsfw = false;
          title = "Fursuits big and small!";
          desc = "Lots of cute and adventurous fursuiters, ya gotta see them all!";
          getFurryImg(option);
          break;
        // nsfw options
        case 'buldge': 
          isNsfw = true;
          title = "Those bulges... OwO";
          desc = "I see that bulgy wulgy >w<";
          getFurryImg(option);
          break;
        case 'kiss':
          isNsfw = true;
          title = "Mwahh! x3";
          desc = "Aww... hehe (blushes)";
          getFurryImg(option);
          break;
        case 'lick':
          isNsfw = true;
          title = "I'm a lick ya!";
          desc = "N-nyahhh! That tickles x3";
          getFurryImg(option);
          break;
        case 'straight':
          isNsfw = true;
          title = "Y-yiff? O//w//O";
          desc = "Hehe, they're going right at it.";
          getFurryImg(option);
        case 'gay':
          isNsfw = true;
          title = "Gay bois!";
          desc = "Now that is some gay stuff right there.";
          getFurryImg(option);
          break;
        case 'lesbian':
          isNsfw = true;
          title = "Girls need love too";
          desc = "Wow these girls sure be gay for each other.";
          getFurryImg(option);
          break;
        case 'gynomorph':
          isNsfw = true;
          title = "Girls... with male junk?";
          desc = "Them gals sure be showing off their junk.";
          getFurryImg(option);
          break;
        default:
          await interaction.editReply({
            content: 'Invalid option or the endpoint does not exist!'
          })
      };
    } catch (error) {
      logger.error('Error occured while attempting to process request!');
      logger.error(error.message); logger.debug(error.stack);
      await interaction.editReply({
        content: 'Something went wrong while fetching image!', ephemeral: true
      });
    };
  }
};