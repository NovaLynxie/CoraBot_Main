const logger = require('../../utils/winstonLogger');
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { stripIndents } = require('common-tags');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Find images from available sources.')
    .addStringOption(option =>
      option
        .setName('source')
        .setDescription('Source to search from?')
        .setRequired(true)
        .addChoice('e621', 'e621')
        .addChoice('e926', 'e926')
        .addChoice('gelbooru', 'gelbooru')
        .addChoice('derpibooru', 'derpibooru')
    )
    .addStringOption(option =>
      option
        .setName('input')
        .setDescription('Tags to search with?')
        .setRequired(true)
    ),
  async execute(interaction, client) {
    await interaction.deferReply();
    const { member, options } = interaction; let data;
    const source = options.getString('source');
    const input = options.getString('input');
    function generateImageEmbed(data) {
      let epost, image, random = Math.floor(Math.random() * 10);
      logger.debug(JSON.stringify(data, null, 2));
      const imageEmbed = new MessageEmbed();
      switch (source) {
        case 'e621':
        case 'e926':
          epost = data.posts[random]; image = epost.file;
          break;
        case 'derpibooru':
        case 'gelbooru':
          image = data[random];
          break;
        default:
          image = null;
          throw new Error(`Unsupported or invalid source ${source}!`);
      }; logger.debug(JSON.stringify(image, null, 2));
      if (!image ) {
        imageEmbed
          .setTitle('No images found!')
          .setDescription(stripIndents`
          Unable to find a matching image or no response received.
          Please re-check your search query and try again.
          If you still do not get any image, please contact my admin.`)
        return imageEmbed;
      };
      imageEmbed
        .setTitle('Image Searcher')
        .setDescription('description.placeholder.text')
        .setImage(image ?.url || image ?.view_url)
      return imageEmbed;
    };
    const apiUrls = {
      "e621": {
        url: "e621.net/posts.json?limit=10&tags=",
        sep: ' '
      },
      "e926": {
        url: "e926.net/posts.json?limit=10&tags=",
        sep: ' '
      },
      "derpibooru": {
        url: "derpibooru.org/api/v1/json/search/images?q=",
        sep: ' '
      },
      "gelbooru": {
        url: "gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=",
        sep: ', '
      }
    };
    const requestUrl = `https://${apiUrls[source].url}${input.split(' ').join(apiUrls[source].sep)}`;
    try {
      logger.debug(`Requesting data from ${requestUrl}`);
      const data = await fetch(requestUrl, { headers: { 'user-agent': 'FetchDemo/1.0 (@novalynxie on replit.com)' } });
      const json = await data.json();
      logger.debug('Got response! Parsing data into embed...');
      await interaction.editReply({ embeds: [await generateImageEmbed(json)] });
    } catch (error) {
      logger.debug('Error occured while processing request!');
      logger.debug(error.stack);
      await interaction.editReply({
        embeds: [await client.utils.embeds.system('error', { error })]
      });
    };
  },
};