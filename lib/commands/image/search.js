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
    const { member, options } = interaction; let data;
    const source = options.getString('source');
    const input = options.getString('input');
    function generateImageEmbed() {
      const imageEmbed = new MessageEmbed()
        .setTitle('Image Searcher')
        .setDescription('description.placeholder.text')
        .setImage()
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
        sep: ','
      }
    };

    // generateImageEmbed(\* PARAMETERS HERE! *\)
  },
};