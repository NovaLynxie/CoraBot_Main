const logger = require('../../plugins/winstonLogger');
const {
	MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu,
} = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);
const { checkVC, joinVC, createSource, newPlayer } = require('../../handlers/voiceManager');
const { stations } = require('../../assets/resources/radioStations.json');
const stationsList = [];
logger.debug('Loading radio stations information...');
stations.forEach(station => {
	const stationData = {
		label: station.name,
		description: station?.genre.join(', '),
		value: station.name,
	};
	stationsList.push(stationData);
});

module.exports = {
	data: new SlashCommandBuilder()
		.setName('radio')
		.setDescription('Starts up the radio!'),
	async execute(interaction, client) {
		let connection = checkVC(interaction.guild);
		let player, source, station;
		await interaction.deferReply({ ephemeral: false });
		const radioEmbedThumb = client.user.displayAvatarURL({ dynamic: true });
		const radioEmbedFooter = 'Powered by DiscordJS Voice (OPUS)';
		const radioMenuEmbed = new MessageEmbed()
			.setTitle('Radio Main Menu')
			.setDescription('Personal Radio Service')
			.setFooter(radioEmbedFooter)
			.setThumbnail(radioEmbedThumb);
		// Radio Player Embed
		const radioPlayerEmbed = new MessageEmbed()
			.setTitle('Radio Player v1.0')
			.setFooter(radioEmbedFooter)
			.setThumbnail(radioEmbedThumb);
		// Radio Selecton Embed
		const radioSelectorEmbed = new MessageEmbed()
			.setTitle('Radio Selection Menu')
			.setFooter(radioEmbedFooter)
			.setThumbnail(radioEmbedThumb);
		// Radio Buttons to control the playback.
		const radioMenuBtns = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('joinVC')
					.setLabel('Join Voice')
					.setStyle('SECONDARY'),
				new MessageButton()
					.setCustomId('leaveVC')
					.setLabel('Leave Voice')
					.setStyle('SECONDARY'),
				new MessageButton()
					.setCustomId('radioPlayer')
					.setLabel('Radio Player')
					.setStyle('SECONDARY'),
				new MessageButton()
					.setCustomId('closeMenu')
					.setLabel('Close Menu')
					.setStyle('DANGER'),
			);
		const radioPlayerBtns = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('play')
					.setLabel('Play')
					.setStyle('SECONDARY'),
				new MessageButton()
					.setCustomId('stop')
					.setLabel('Stop')
					.setStyle('DANGER'),
				new MessageButton()
					.setCustomId('radioIndex')
					.setLabel('Radio Menu')
					.setStyle('PRIMARY'),
			);
		// Radio Selection for choosing the station to play back.
		const radioStationsMenu = new MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomId('stationSelect')
					.setPlaceholder('Select a station to tune into!')
					.addOptions(stationsList),
			);
		// Radio functions which control all of the radio functionality.
		function loadStation(interact) {
			for (let i = 0; i < stations.length; ++i) {
				station = stations[i];
				if (interact.values[0] === station.name) break;
			}
			logger.debug(`station:${JSON.stringify(station)}`);
			source = createSource(station.url);
		}
		async function joinChannel(channel) {
			connection = checkVC(interaction.guild);
			try {
				if (!connection) {
					logger.debug(`No connections found in ${interaction.guild.name}, creating one.`);
					connection = await joinVC(interaction.member.voice.channel);
				} else {
					logger.debug(`Connection already active in ${interaction.guild.name}.`);
				};
			} catch (err) {
				logger.error('An error occured while opening a connection!');
				logger.error(err.message); logger.debug(err.stack);
				const errEmbed = new MessageEmbed()
					.setTitle('Radio has stopped working!')
					.setDescription('Failed to open a connection, stopped radio interaction. Please run /radio again.')
					.addFields(
						{ name: 'Error Data', value: `\`\`\`${err}\`\`\`` },
					);
				return interaction.editReply({
					embeds: [errEmbed],
				});
			};
		};
		// Dynamic Radio Player Embed
		function dynamicPlayerEmbed(station) {
			let playerState;
			switch (player?._state.status) {
			case 'idle':
				playerState = 'Idle';
				break;
			case 'buffering':
				playerState = 'Buffering';
				break;
			case 'playing':
				playerState = 'Playing';
				break;
			case 'autopaused':
				playerState = 'AutoPaused';
				break;
			case 'pause':
				playerState = 'Paused';
				break;
			default:
				playerState = 'Stopped';
			}
			radioPlayerEmbed.fields = [
				{
					name: 'Player Status',
					value: playerState,
				},
				{
					name: 'Station Information',
					value: (station) ? `Name: ${station?.name}
          Desc:  ${station?.desc}` : 'No station loaded.',
				},
				{
					name: 'Now Playing (WIP)',
					value: 'Nothing is playing...',
				},
			];
			return radioPlayerEmbed;
		};
		// Update player interface from dynamic embed.
		async function refreshPlayer(interact) {
			try {
				await interact.editReply(
					{
						embeds: [dynamicPlayerEmbed(station)],
						components: [radioPlayerBtns, radioStationsMenu],
					},
				);
			} catch (err) {
				logger.debug('Error updating player interface!');
				logger.debug(err.stack);
			};
		};
		const collector = interaction.channel.createMessageComponentCollector({ time: 300000 });
		let menuOpen, playerOpen;
		player = (!player) ? newPlayer() : player;
		// Player Event Handler.
		player.on('stateChange', (oldState, newState) => {
			logger.debug(`oldState.status => ${oldState?.status}`);
			logger.debug(`newState.status => ${newState?.status}`);
			if (playerOpen) refreshPlayer(interaction);
		});
		player.on(AudioPlayerStatus.Playing, () => {
			logger.debug('Player has started playing!');
		});
		player.on(AudioPlayerStatus.Idle, () => {
			logger.debug('Player currently idle/paused. Awaiting new requests.');
		});
		player.on(AudioPlayerStatus.AutoPaused, () => {
			player.pause();
			logger.debug('Player auto paused since not connected. Waiting for connections.');
		});
		player.on('error', err => {
			logger.error('Error occured while playing stream!');
			logger.error(err.message); logger.debug(err.stack);
			player.stop();
		});
		// Menu/Button collecter and handler.
		collector.on('collect', async interact => {
			await interact.deferUpdate();
			await wait(1000);
			// Button Switch/Case Handler
			switch (interact.customId) {
			// button actions - radio menu
			case 'radioIndex':
				playerOpen = false;
				menuOpen = true;
				await interact.editReply(
					{
						embeds: [radioMenuEmbed],
						components: [radioMenuBtns],
					},
				);
				break;
			case 'closeMenu':
				menuOpen = false;
				await interact.editReply(
					{
						content: 'Radio menu closed.',
						embeds: [], components: [],
					},
				);
				await wait(5000);
				await interact.deleteReply();
				collector.stop();
				break;
				// button actions - radio player
			case 'radioPlayer':
				playerOpen = true;
				refreshPlayer(interact);
				break;
				// Join/Leave Voice Actions
			case 'joinVC':
				if (!interaction.member.voice.channel) {
					interact.followUp({
						content: 'You are not in a voice channel! Please join one first!',
						ephemeral: true,
					});
				}
				connection = await joinVC(interaction.member.voice.channel);
				break;
			case 'leaveVC':
				if (!interaction.member.voice.channel) {
					interact.followUp({
						content: 'You are not in a voice channel! Join the bot\'s voice channel first.',
						ephemeral: true,
					});
				} else
				if (!connection) {
					interact.followUp({
						content: 'The bot',
						ephemeral: true,
					});
				};
				connection.destroy();
				break;
				// Radio Player Actions
			case 'play':
				if (!player) return;
				player.play(source);
				connection.subscribe(player);
				break;
			case 'pause':
				if (!player) return;
				player.pause();
				break;
			case 'stop':
				if (!player) return;
				player.stop();
				break;
				// Radio Selection Actions
			case 'stationSelect':
				if (!player) return;
				loadStation(interact);
				player.play(source);
				refreshPlayer(interact);
				break;
				// fallback action for all radio menus
			default:
				logger.warn('Invalid or unknown action called!');
				logger.verbose('radio.button.default.trigger');
				await interact.editReply(
					{
						content: 'That action is invalid or not available!',
					},
				);
			}
		});
		collector.on('end', async collected => {
			logger.debug('Collector in radio commmand timed out or was stopped.');
			logger.debug(`Collected ${collected.size} items.`);
			if (!menuOpen) return;
			await interaction.editReply(
				{
					content: 'Radio Menu timed out. To continue using the menu, run /radio again.',
					embeds: [], components: [],
				},
			);
			await wait(5000);
			await interaction.deleteReply();
		});
		menuOpen = true;
		interaction.editReply({
			embeds: [radioMenuEmbed],
			components: [radioMenuBtns],
			ephemeral: false,
		});
	},
};