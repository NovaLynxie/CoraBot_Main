const logger = require('../../utils/winstonLogger');
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('node-fetch');
const { stripIndents } = require('common-tags');
const { credentials } = require('../../handlers/bootLoader');
const yiff = require('yiff');
const e6 = new yiff.e621();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('e621')
		.setDescription('Fetches animal images and displays them back to the user.')
		.addStringOption(option =>
			option
				.setName('input')
				.setDescription('Type in the tags you would like to search with. Separate each tag with a space.')
				.setRequired(true)
		),
	execute(interaction, client) {
		const input = interaction.options.getString('input');
    console.log(interaction.channel);
    if (!interaction.channel.nsfw) return interaction.reply({
      content: 'Whoops! This command only works in NSFW channels!'
    });
		logger.verbose(`input=${input}`);
    const tags = input.split(' ');
		function generateEmbed(data) {
			const imageEmbed = new MessageEmbed()
				.setColor('#0099ff')
				.setTitle('E621 Image Fetcher v2')
        .setDescription(`You searched: ${tags}`)
				.setImage(data.image)
        .setFooter({
          text: 'Bot created and maintained by NovaLynxie. Powered by E621', iconURL: client.user.displayAvatarURL({ format: 'png' })
        });
			return interaction.reply({ embeds: [imageEmbed] });
		};
    logger.debug('Requesting image from user defined tags.');
    e6.request(tags).then(res => {
      logger.debug('Received  response! Parsing data into embed.');
      logger.data(`res => ${JSON.stringify(res, null, 2)}`);
      let data = JSON.parse(JSON.stringify(res));
      generateEmbed(res);
      logger.debug('Embed sent to user channel.');
    }).catch(err => {
      logger.error('Whoops! An error occured.');
      logger.error(err);
    });
    logger.debug('Request from user has been sent.');
	},
};