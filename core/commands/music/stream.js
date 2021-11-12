const logger = require('../../utils/winstonLogger');
const { checkVC, joinVC, createSource, newPlayer } = require('../../handlers/voiceManager');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stream')
		.setDescription('Streams audio from a valid audio stream URL. (DEPRECIATED! Use /radio instead.)')
		.addStringOption(option =>
			option
				.setName('url')
				.setDescription('Enter a valid stream URL.')
				.setRequired(false),
		),
	async execute(interaction, client) {
		await interaction.deferReply({ ephemeral: true });
		let connection = checkVC(interaction.guild);
		const streamURL = interaction.options.getString('url');
		if (streamURL) {
			try {
				if (!connection || connection === undefined) {
					logger.debug(`No connections active for ${interaction.guild.name}! Creating one now.`);
					connection = await joinVC(interaction.member.voice.channel);
				}
				else {
					logger.debug(`Connection active in ${interaction.guild.name}! Using this instead.`);
				}
			}
			catch (err) {
				logger.error('An error occured while opening a connection!');
				logger.error(err.message); logger.debug(err.stack);
				const errEmbed = new MessageEmbed()
					.setTitle('Error occured!')
					.addFields(
						{ name: 'Error Data', value: `\`\`\`${err}\`\`\`` },
					);
				return interaction.editReply({
					embeds: [errEmbed],
				});
			}
			const player = newPlayer();
			const source = createSource(streamURL);
			try {
				logger.debug('Starting player now.');
				player.play(source);
				logger.debug('Binding player to connection.');
				connection.subscribe(player);
				logger.debug('Bound connection to Player!');
				player.on('stateChange', (oldState, newState) => {
					logger.debug(`oldState.status => ${oldState?.status}`);
					logger.debug(`newState.status => ${newState?.status}`);
				});
				player.on(AudioPlayerStatus.Playing, () => {
					logger.debug('Player has started playing!');
					const radioEmbed = new MessageEmbed()
						.setColor('#5E2071')
						.addFields(
							{ name: 'State', value: 'Playing' },
							{ name: 'Now Playing', value: streamURL },
						);
					interaction.editReply({ embeds: [radioEmbed] });
				});
				player.on(AudioPlayerStatus.Idle, () => {
					const radioEmbed = new MessageEmbed()
						.setColor('#5E2071')
						.addFields(
							{ name: 'State', value: 'Idle/Paused' },
							{ name: 'Now Playing', value: streamURL },
						);
					interaction.editReply({ embeds: [radioEmbed] });
					logger.debug('Player currently idle/paused. Awaiting new requests.');
				});
				player.on(AudioPlayerStatus.AutoPaused, () => {
					player.pause();
					const radioEmbed = new MessageEmbed()
						.setColor('#5E2071')
						.addFields(
							{ name: 'State', value: 'AutoPaused' },
							{ name: 'Now Playing', value: streamURL },
						);
					interaction.editReply({ embeds: [radioEmbed] });
					logger.debug('Player currently autopaused. Awaiting new requests.');
				});
				player.on('error', err => {
					interaction.editReply({
						content: 'Error occured during stream playback!',
						embeds: [],
						ephemeral: true,
					});
					logger.error('Error occured while playing stream!');
					logger.error(err.message); logger.debug(err.stack);
					player.stop();
				});
			}
			catch (err) {
				logger.error('There was a problem trying to start the stream!');
				logger.error(err.message); logger.debug(err.stack);
				interaction.editReply({
					content: 'Something went wrong in executing this command!',
					ephemeral: true,
				});
			}
		}
		else {
			//
		}
	},
};