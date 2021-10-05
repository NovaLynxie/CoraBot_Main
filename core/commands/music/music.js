const logger = require('../../plugins/winstonLogger');
const {
	MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu,
} = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');
const SoundCloud = require('soundcloud-scraper');
const scClient = new SoundCloud.Client();
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
		let player, source, track;
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
		const musicQueueEmbed = new MessageEmbed()
			.setTitle('Music Queue System')
      .setDescription(`Music Queue for ${interaction.guild.name}`)
      .setThumbnail(musicEmbedThumb)
			.setFooter(musicEmbedFooter);
		// Music Buttons to control the playback.
    const musicPlayerCtrlBtns = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('play')					
          .setEmoji('▶️')
					.setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('pause')
          .setEmoji('⏸️')
          .setStyle('SECONDARY'),
				new MessageButton()
					.setCustomId('stop')					
          .setEmoji('⏹️')
					.setStyle('SECONDARY'),
        new MessageButton()
					.setCustomId('rewind')					
          .setEmoji('⏪')
					.setStyle('SECONDARY'),
				new MessageButton()
					.setCustomId('fastfoward')					
          .setEmoji('⏩')
					.setStyle('SECONDARY'),
			);
    const musicPlayerExtBtns = new MessageActionRow()
			.addComponents(				
        new MessageButton()
					.setCustomId('joinLeaveVC')
					.setEmoji('🎤')
					.setStyle('SECONDARY'),
        new MessageButton()
					.setCustomId('prevTrack')
          .setEmoji('⏮️')
					.setStyle('SECONDARY'),
				new MessageButton()
					.setCustomId('queue')
          .setEmoji('📜')
					.setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('nextTrack')
          .setEmoji('⏭️')
          .setStyle('SECONDARY'),
				new MessageButton()
					.setCustomId('closePlayer')
          .setEmoji('❌')
					.setStyle('SECONDARY'),
			);
    // Music command local functions.
    async function sourceVerifier(input) {
      let song, stream, data, object;
      data = await client.data.get(interaction.guild);
      if (input.match(/(soundcloud.com)/gi)) {        
        object = { type: 'soundcloud', url: input };
      } else
      if (input.match(/(youtube.com)/gi)) {
        object = { type: 'youtube', url: input };
      };
      data.music.queue.push(object);
      await client.data.set(data, interaction.guild);
    };
    async function loadSong() {
      let data = await client.data.get(interaction.guild);
      let { type, url } = data.music.queue[0], stream;
      if (type === 'soundcloud') {
        song = await scClient.getSongInfo(url);
        stream = await song.downloadProgressive();
      } else
      if (type === 'youtube') {
        song = ytdl.getBasicInfo(url);
        stream = await ytdl(url);
      };
      track = song;
      source = createSource(stream);
      return source;
    };
    // Dynamic Music Embeds
    async function dynamicQueueEmbed(queue) {
      let field = {}, no = 1, info;
      for (const item of queue) {
        let { type, url } = item;
        switch (type) {
          case "youtube":
            info = await ytdl.getInfo(url);
            field = {
              name: `Track #${no}`,
              value: `
              Title: ${info.videoDetails.title}
              Keywords: ${info.videoDetails.keywords.join(', ')}
              Sourced from YouTube`
            };
            break;
          case "soundcloud":
            info = await scClient.getSongInfo(url)
            field = {
              name: `Track #${no}`,
              value: `
              Title: ${info.title}
              Genre: ${info.genre}
              Sourced from SoundCloud`
            };
            break;
          default:          
            field = {
              name: `Track #${no}`,
              value: `
              No metadata available.
              URL: ${item.url}
              `
            };
        }; track++;
        musicQueueEmbed.addFields(field);        
      };
      return musicQueueEmbed;
    };
		function dynamicPlayerEmbed(song) {
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
					value: (playerState) ? playerState : '...',
				},
				{
					name: 'Song Information',
					value: (song) ? `${song?.title}` : 'No song loaded.',
				}
			];
			return musicPlayerEmbed;
		};
		// Update player interface from dynamic embed.
		async function refreshPlayer(interact) {
			try {
				await interact.editReply(
					{
						embeds: [dynamicPlayerEmbed(track)],
						components: [musicPlayerCtrlBtns, musicPlayerExtBtns],
					},
				);
			} catch (err) {
				logger.debug('Error opening/updating player interface!');
				logger.debug(err.stack);
			};
		};
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
      data = await client.data.get(interact.guild);
			await interact.deferUpdate();
			await wait(1000);
			// Button Switch/Case Handler
			switch (interact.customId) {
			case 'closePlayer':
				menuOpen = false;
				await interact.editReply(
					{
						content: 'Music Player hidden! Run /music player to reopen it.',
						embeds: [], components: [],
					},
				);
				await wait(5000);
				await interact.deleteReply();
				collector.stop();
				break;				
				// Join/Leave Voice Actions
			case 'joinLeaveVC':
        if (!interaction.member.voice.channel) {
					interact.followUp({
						content: 'You are not in a voice channel! Please join one first!',
						ephemeral: true,
					});
				};
        if (!connection) {
					connection = await joinVC(interaction.member.voice.channel);
				} else
        if (connection) {
          connection.destroy();
        };
				break;
				// Music Player Actions
			case 'play':
				if (!player) return;
        if (!source) source = await loadSong();
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
			case 'queue':
        await interact.editReply(
          {
            embeds: [await dynamicQueueEmbed(data.music.queue)]
          }
        )
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
					content: 'Music Player timed out. Please run /music again.',
					embeds: [], components: [],
				},
			);
			await wait(5000);
			await interaction.deleteReply();
		});
    if (subcmd === 'add') {
      await sourceVerifier(interaction.options.getString('url'));
      interaction.editReply({
        content: 'Song added successfully to the queue!',
        ephemeral: true
      });
    };
    if (subcmd === 'player') {
      //menuOpen = true;
      playerOpen = true;
      await refreshPlayer(interaction);
    };
	},
};