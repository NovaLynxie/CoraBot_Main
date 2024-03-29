const logger = require('../../utils/winstonLogger');
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { stripIndents } = require('common-tags');
const { credentials } = require('../../handlers/bootLoader');
const { cheweyApiToken } = credentials;
const authHeader = `?auth=${cheweyApiToken}`;
const apiUrl = 'https://api.chewey-bot.top/';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('animal')
    .setDescription('Fetches animal images and displays them back to the user.')
    .addStringOption(option =>
      option
        .setName('option')
        .setDescription('Which animal would you like to see?')
        .setRequired(true)
        .addChoice('bird', 'birb')
        .addChoice('cat', 'cat')
        .addChoice('dog', 'dog')
        .addChoice('duck', 'duck')
        .addChoice('fox', 'fox')
        .addChoice('koala', 'koala')
        .addChoice('otter', 'otter')
        .addChoice('owl', 'owl')
        .addChoice('panda', 'panda')
        .addChoice('rabbit', 'rabbit')
        .addChoice('red panda', 'red-panda')
        .addChoice('snake', 'snake')
        .addChoice('turtle', 'turtle')
        .addChoice('wolf', 'wolf'),
    ),
  execute(interaction, client) {
    const option = interaction.options.getString('option');
    logger.verbose(`option=${option}`);
    logger.debug(`${apiUrl}${option}${authHeader}`);
    function imgEmbed(url) {
      const imageEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Animal Handler v2')
        .setImage(url)
        .setFooter({
          text: 'Bot created and maintained by NovaLynxie. Image provided by CheweyBotAPI.', iconURL: client.user.displayAvatarURL({ format: 'png' })
        });
      return interaction.reply({ embeds: [imageEmbed] });
    };
    fetch(`${apiUrl}${option}${authHeader}`)
      .then(res => res.json())
      .then(json => {
        logger.debug('verifying json object data');
        logger.data(json);
        imgEmbed(json.data);
      }).catch(err => {
        logger.error('Error occured while fetching/parsing data!');
        logger.error(err); logger.debug(err.stack);
        interaction.reply({ content: 'Failed to fetch/parse response data!'});
      });
    return;
  },
};