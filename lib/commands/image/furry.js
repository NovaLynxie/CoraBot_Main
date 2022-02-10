const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../../utils/winstonLogger');
const { credentials } = require('../../handlers/bootLoader');
const { yiffyApiKey, userAgent } = credentials;
const { stripIndents } = require('common-tags');
const endpoints = require('../../assets/resources/yiffyFurry.json');
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
        .addChoice('butts', 'butts')
        .addChoice('lick', 'lick')
        .addChoice('bulge', 'bulge')
        .addChoice('kiss', 'kiss')
        .addChoice('gay', 'gay')
        .addChoice('lesbian', 'lesbian')
        .addChoice('andromorph', 'andromorph')
        .addChoice('shemale', 'gynomorph')
    ),
  async execute(interaction, client) {
    // TODO! Rewrite furry command to use the furryEndpoints.json for command handling instead of switch/case statements.
    await interaction.deferReply({ ephemeral: false });
    const { channel, options } = interaction;
    const option = options.getString('option');
    let isNsfw, title, desc;
    logger.verbose(`option=${option}`);
    function generateEmbed(data, opts = {}) {
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
            name: 'Artists', value: (artists !== '') ? artists : 'N/A'
          },
          {
            name: 'Sources', value: (sources !== '') ? sources : 'N/A'
          },
          {
            name: 'Report Content', value: `Is this inappropriate content? Report it [here](${reports})!`
          }
        )
        .setThumbnail(client.user.avatarURL({ format: "png" }))
        .setImage(data.yiffMediaURL)
        .setFooter({
          text: 'Bot created and maintained by NovaLynxie. Powered by Yiffy API', iconURL: client.user.displayAvatarURL({ format: 'png' })
        });
      return interaction.editReply({ embeds: [imageEmbed] });
    };
    const randomizer = (length) => Math.floor(Math.random() * length);
    function getFurryImg() {
      let data = endpoints[option];
      title = data.embed.titles[randomizer(data.embed.titles.length)];
      desc = data.embed.descriptions[randomizer(data.embed.descriptions.length)];
      if (data.nsfw) {
        if (!channel.nsfw) return interaction.reply({
          content: 'NSFW content not allowed in channels not marked as NSFW! Try again in a different channel or enable NSFW for this channel first.'
        });
        try {
          yiffy.furry.yiff[data.route]("json", 1).then(res => generateEmbed(res, { title, desc }));
        } catch (err) {
          logger.error(err.message); logger.debug(err.stack);
          interaction.editReply({
            content: 'Failed to fetch image from endpoint!',
            ephemeral: true
          });
        };
      } else {
        try {
          yiffy.furry[data.route]("json", 1).then(res => generateEmbed(res, { title, desc }));
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
      if (endpoints[option]) { getFurryImg(option) } else {
        await interaction.editReply({
          content: 'Unknown or Invalid Option!'
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