const logger = require('../../../plugins/winstonLogger');
const {
	MessageActionRow, MessageButton, MessageEmbed,
} = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args)); // used for parsing json response.
// const fetch = require('node-fetch'); // used for parsing json response.
const { stripIndents } = require('common-tags');
const { credentials } = require('../../../handlers/bootLoader');
const { cheweyApiToken } = credentials; // my unique api token.
const authHeader = `?auth=${cheweyApiToken}`; // auth parameter.
const apiUrl = 'https://api.chewey-bot.top/'; // cheweybot api domain.

module.exports = {
	data: new SlashCommandBuilder()
		.setName('animal')
		.setDescription('Fetches animal images and displays them back to the user.')
		.addStringOption(option =>
			option
				.setName('option')
				.setDescription('Which animal would you like to see?')
				.setRequired(false)
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
				.addChoice('red panda', 'redpanda')
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
				.setFooter('Bot created and maintained by NovaLynxie. Image provided by CheweyBotAPI.', client.user.displayAvatarURL({ format: 'png' }));
			return interaction.reply({ embeds: [imageEmbed] });
			// Send the image embed to the channel the user ran the command.
		}

		fetch(`${apiUrl}${option}${authHeader}`) `${apiUrl}${option}${authHeader}`
			.then(checkStatus)
			.then(res => res.json())
			.then(json => {
				logger.debug('verifying json object data');
				logger.data(json);
				imgEmbed(json.data);
			}).catch(err => {
				logger.error('Error occured while fetching/parsing data!');
				logger.error(err); logger.debug(err.stack);
			});
		return;
	},
};