const logger = require('../../plugins/winstonLogger');
const {
	MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu,
} = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');
const SoundCloud = require('soundcloud-scraper');
const sndCldClient = SoundCloud.Client();
const wait = require('util').promisify(setTimeout);
const { checkVC, joinVC, createSource, newPlayer } = require('../../handlers/voiceManager');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('music')
		.setDescription('Plays back music from supported sources!')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a song to the queue.')
        .addStringOption(option => 
          option
            .setName('url')
            .setDescription('Enter a valid song url.')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('player')
        .setDescription('Start up the player.')
    ),
	async execute(interaction, client) {
		let connection = checkVC(interaction.guild);
		let player, source;
    await interaction.deferReply({ ephemeral: false });
    const subcmd = interaction.options.getSubcommand();		
		const musicEmbedThumb = client.user.displayAvatarURL({ dynamic: true });
		const musicEmbedFooter = 'Powered by DiscordJS Voice (OPUS)';
		const musicMenuEmbed = new MessageEmbed()
			.setTitle('Music Main Menu')
			.setDescription('Music Service')
			.setThumbnail(musicEmbedThumb)
      .setFooter(musicEmbedFooter);		
		// Music Player Embed
		const musicPlayerEmbed = new MessageEmbed()
			.setTitle('Music Player v1.0')
      .setThumbnail(musicEmbedThumb)
			.setFooter(musicEmbedFooter);
		// Music Selecton Embed
		const musicSelectorEmbed = new MessageEmbed()
			.setTitle('Music Queue System')
      .setDescription(`Music Queue for ${interaction.guild.name}`)
      .setThumbnail(musicEmbedThumb)
			.setFooter(musicEmbedFooter);
		// Music Buttons to control the playback.
		const musicMenuBtns = new MessageActionRow()
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
					.setCustomId('musicPlayer')
					.setLabel('Music Player')
					.setStyle('SECONDARY'),
        new MessageButton()
					.setCustomId('queue')
					.setLabel('Open Queue')
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('closeMenu')
					.setLabel('Close Menu')
					.setStyle('DANGER'),
			);
		const musicPlayerBtns = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('play')
					.setLabel('Play')
					.setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('pause')
          .setLabel('Pause')
          .setStyle('SECONDARY'),
				new MessageButton()
					.setCustomId('stop')
					.setLabel('Stop')
					.setStyle('DANGER'),
        new MessageButton()
					.setCustomId('musicQueue')
					.setLabel('Open Queue')
					.setStyle('PRIMARY'),
				new MessageButton()
					.setCustomId('musicIndex')
					.setLabel('Back to Menu')
					.setStyle('PRIMARY'),
			);
    
    async function joinChannel(channel) {
			connection = checkVC(interaction.guild);
			try {
				if (!connection) {
					logger.debug(`No connections found in ${interaction.guild.name}, creating one.`);
					connection = await joinVC(interaction.member.voice.channel);
				}
				else {
					logger.debug(`Connection already active in ${interaction.guild.name}.`);
				}
			}
			catch (err) {
				logger.error('An error occured while opening a connection!');
				logger.error(err.message); logger.debug(err.stack);
				const errEmbed = new MessageEmbed()
					.setTitle('Radio has stopped working!')
					.setDescription('Failed to open a connection, stopped music interaction. Please run /music again.')
					.addFields(
						{ name: 'Error Data', value: `\`\`\`${err}\`\`\`` },
					);
				return interaction.editReply({
					embeds: [errEmbed],
				});
			}
		};
    async getSoundcloudSong() {
      //
    };
    function sourceVerifier(song) {
      //
    };
		// Dynamic Music Player Embed
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
			musicPlayerEmbed.fields = [
				{
					name: 'Player Status',
					value: playerState,
				},
				{
					name: 'Song Information',
					value: (song) ? `Name: ${song?.name}
          Desc:  ${song?.desc}` : 'No station loaded.',
				},
				{
					name: 'Now Playing (WIP)',
					value: 'Nothing is playing...',
				},
			];
			return musicPlayerEmbed;
		};
		// Update player interface from dynamic embed.
		async function refreshPlayer(interact) {
			try {
				await interact.editReply(
					{
						embeds: [dynamicPlayerEmbed(station)],
						components: [musicPlayerBtns],
					},
				);
			}
			catch (err) {
				logger.debug('Error updating player interface!');
				logger.debug(err.stack);
			}
		}
		// Create interaction collecter to fetch button interactions.
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
			// button actions - music menu
			case 'musicIndex':
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
				// button actions - music player
			case 'musicPlayer':
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
				}
				else
				if (!connection) {
					interact.followUp({
						content: 'The bot',
						ephemeral: true,
					});
				}
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
			case 'queue':
				if (!player) return;
				// player.play(source);
				// refreshPlayer(interact);
				break;
				// fallback action for all music menus
			default:
				logger.warn('Invalid or unknown action called!');
				logger.verbose('music.button.default.trigger');
				await interact.editReply(
					{
						content: 'That action is invalid or not available!',
					},
				);
			}
		});
		// Log on collector end (temporary)
		collector.on('end', async collected => {
			logger.debug('Collector in music commmand timed out or was stopped.');
			logger.debug(`Collected ${collected.size} items.`);
			if (!menuOpen) return; // don't edit replies after this is called!
			await interaction.editReply(
				{
					content: 'Music Menu timed out. To continue using the menu, run /music again.',
					embeds: [], components: [],
				},
			);
			await wait(5000);
			await interaction.deleteReply();
		});
		menuOpen = true;
		interaction.editReply({
			embeds: [musicMenuEmbed],
			components: [musicMenuBtns],
			ephemeral: false,
		});
	},
};