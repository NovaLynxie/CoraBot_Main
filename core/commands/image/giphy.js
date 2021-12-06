const logger = require('../../utils/winstonLogger');
const giphy = require('giphy-api')();
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { stripIndents } = require('common-tags');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giphy')
    .setDescription('Search gifs using giphy.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('search')
        .setDescription('Search by keywords')
        .addStringOption(option =>
          option
            .setName('input')
            .setDescription('keywords')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('id')
        .setDescription('Search by unique ID')
        .addStringOption(option =>
          option
            .setName('input')
            .setDescription('unique ID')
            .setRequired(true)
        )
    )
  ,
  execute(interaction, client) {
    const options = interaction.options;
    const subcmd = options.getSubcommand();
    const input = options.getString('input');
    function imgEmbed(url) {
      const imageEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Giphy API')
        .setImage(url)
        .setFooter('Bot created and maintained by NovaLynxie. Image provided by Giphy.', client.user.displayAvatarURL({ format: 'png' }));
      return interaction.reply({ embeds: [imageEmbed] });
    };
    function giphySearchByWord() {
      giphy.search(input).then(res => {
        logger.data(JSON.stringify(res, null, 2));
      });
    };
    function giphySearchByID() {
      giphy.id(input).then(res => {
        logger.data(JSON.stringify(res, null, 2));
      });
    };
    function giphyGetTrending() {
      giphy.trending().then(res => {
        logger.data(JSON.stringify(res, null, 2));
      });
    };
    switch (subcmd) {
      case 'search':
        giphySearchByWord()
        break;
      case 'id':
        break;
        giphySearchByID()
    };
    interaction.reply({ content: 'command.test_message.placeholder' });
  }
};