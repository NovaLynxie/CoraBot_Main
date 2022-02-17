const logger = require('../../utils/winstonLogger');
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { stripIndents } = require('common-tags');
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
    sep: ', '
  },
  "furbooru": {
    url: "furbooru.org/api/v1/json/search/images?&q=",
    sep: ', '
  },
  "gelbooru": {
    url: "gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&tags=",
    sep: ', '
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('image')
    .setDescription('Find images from available sources.')
    .addStringOption(option =>
      option
        .setName('source')
        .setDescription('Source to search from?')
        .setRequired(true)
        .addChoice('e621', 'e621')
        .addChoice('e926', 'e926')
        .addChoice('derpibooru', 'derpibooru')
        .addChoice('furbooru', 'furbooru')
        .addChoice('gelbooru', 'gelbooru')
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
      let entry, image, tags = '', random = Math.floor(Math.random() * 10);
      const randomizer = (length = 1) => Math.floor(Math.random * length);
      const hasData = (data) => (data) ? true : false;
      logger.debug(JSON.stringify(data, null, 2));
      const imageEmbed = new MessageEmbed();
      switch (source) {
        case 'e621':
        case 'e926':
          entry = data.posts[randomizer(data.posts.length)];
          image = (hasData(entry)) ? { url: entry.file.url } : null;
          break;
        case 'derpibooru':
        case 'furbooru':
        case 'gelbooru':
          entry = data.images[randomizer(data.images.length)];
          image = (hasData(entry)) ? { url: entry.view_url } : null;
          break;
        default:
          image = null;
          throw new Error(`Unsupported or invalid source ${source}!`);
      };
      if (!image) {
        imageEmbed
          .setTitle('❔ No images found.')
          .setDescription(stripIndents`
          Unable to find a matching image or no response received.
          Please re-check your search query and try again.
          If you still do not get any image, please contact my admin.`)
        return imageEmbed;
      };
      for (const item of Object.keys(entry.tags)) {
        if (typeof entry.tags[item] === "object") {
          if (!entry.tags[item].length) continue;
          tags = tags.concat('\n', `> **${item}** \n${entry.tags[item].join(', ')}`);
        } else {
          tags = entry.tags.join(', '); break;
        };
      };
      imageEmbed
        .setTitle('Image Searcher')
        .setDescription(entry ?.description || 'No description found!')
        .setImage(image ?.url || image ?.view_url)
        .addFields(
          {
            name: 'Tags', value: stripIndents`
              ${(tags) ? tags : 'N/A'}
            `
          },
          {
            name: 'Sources', value: stripIndents`
            ${(entry.sources) ? entry.sources.join('\n') : 'N/A'}`
          }
        )
      return imageEmbed;
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