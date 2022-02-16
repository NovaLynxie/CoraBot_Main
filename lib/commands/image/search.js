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
      const imageEmbed = new MessageEmbed()
        .setTitle('Image Searcher')
        .setDescription('description.placeholder.text')
        .setImage()
      return imageEmbed;
    };
    const apiUrls = {
      "e621": {
        url: "e621.net/posts.json?limit=1&tags=",
        sep: ' '
      },
      "e926": {
        url: "e926.net/posts.json?limit=1&tags=",
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
    const requestUrl = `${apiUrls[source]}${input.split(' ').join(apiUrls[source].sep)}`;
    let response;
    try {
      const data = await fetch(requestUrl);
      await interaction.editReply({ embeds: [await generateImageEmbed] });
    } catch (error) {
      logger.debug(error.stack);
      await interaction.editReply({
        embeds: [await client.utils.embed.system('error', { error })]
      });
    };
  },
};