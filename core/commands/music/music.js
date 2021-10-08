const logger = require('../../plugins/winstonLogger');
const { credentials } = require('../../handlers/bootLoader');
const { youtubeApiKey } = credentials;
const { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');
const SoundCloud = require('soundcloud-scraper');
const YouTube = require('simple-youtube-api');
const ytas = new YouTube(youtubeApiKey);
const scbi = new SoundCloud.Client();
const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const wait = require('util').promisify(setTimeout);
const { checkVC, joinVC, createSource, newAudioPlayer } = require('../../handlers/voiceManager');
let audioPlayer = newAudioPlayer(), stopped = false;

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
        .setName('search')
        .setDescription('Search for a song using key words.')
        .addStringOption(option =>
          option
            .setName('youtube')
            .setDescription('Search through YouTube.')
            .setRequired(true)
        )
        .addStringOption(option =>
          option
            .setName('soundcloud')
            .setDescription('Search through Soundcloud.')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('player')
        .setDescription('Start up the player.')
    ),
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: false });
    let guild = interaction.guild, collector, source, track;
    let connection = checkVC(guild);
    let data = await client.data.get(guild);
    const subcmd = interaction.options.getSubcommand();
    const musicEmbedThumb = client.user.displayAvatarURL({ dynamic: true });
    const musicEmbedFooter = 'Powered by DiscordJS Voice (OPUS)';
    // Music Player Embed
    const musicPlayerEmbed = new MessageEmbed()
      .setTitle('Music Player v1.0')
      .setThumbnail(musicEmbedThumb)
      .setFooter(musicEmbedFooter);
    // Music Queue Embed
    const musicQueueEmbed = new MessageEmbed()
      .setTitle(`Queued Songs for ${guild.name}`)
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
          .setCustomId('clear')
          .setEmoji('🆑')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('queue')
          .setEmoji('📜')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('skip')
          .setEmoji('⏭️')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('closePlayer')
          .setEmoji('❌')
          .setStyle('SECONDARY'),
      );
    // Music command local functions.
    async function soundcloudSongsParser(url) {
      let playlist = await scbi.getPlaylist(url);
      let queue = [], object = {};
      interaction.editReply({
        content: 'SoundCloud playlist detected! Parsing songs...',
        ephemeral: true
      });
      playlist.tracks.forEach(track => {
        if (!track.permalink_url) return logger.debug('Skipped track  due to incomplete/malformed response.');
        object = {type: 'soundcloud', url: track.permalink_url};
        queue.push(object);
      });
      interaction.editReply({
        content: 'Finished parsing songs. Adding to queue now.',
        ephemeral: true
      });
      return queue;
    };
    async function youtubeSongsParser(source) {
      playlist = await ytpl(source);
      interaction.editReply({
        content: 'YouTube playlist detected! Parsing songs...',
        ephemeral: true
      });
      playlist.items.forEach(item => {
        if (!item.shortURL || !item.url) return logger.debug('Skipped video due to incomplete/malformed response.');
        object = {type: 'soundcloud', url: item.shortURL || item.url};
        queue.push(object);
      });
      interaction.editReply({
        content: 'Finished parsing songs. Adding to queue now.',
        ephemeral: true
      });
      return queue;
    };
    async function verifySource(input) {
      let song, stream, object, list;
      let urlRegex = /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
      if (input.match(urlRegex)) {
        if (input.match(/(soundcloud.com)/gi)) {
          if (input.match(/(\/sets\/)/gi)) {
            list = await soundcloudSongsParser(input);
          } else {
            object = { type: 'soundcloud', url: input };
          };          
        } else
        if (input.match(/(youtube.com)/gi)) {
          if (input.match(/(\/playlist?)/gi)) {
            list = await youtubeSongsParser(input);
          } else {
            object = { type: 'youtube', url: input };
          };          
        } else {
          interaction.editReply({
            content: 'That song URL is not supported!',
            ephemeral: true
          }); return;
        };
      } else {
        interaction.editReply({
            content: 'The input must be a valid URL link!'
        }); return;
      };      
      interaction.editReply({
        content: 'Songs added successfully to the queue!',
        ephemeral: true
      });
      if (object) data.music.queue.push(object);
      if (list) data.music.queue = data.music.queue.concat(list);
      await client.data.set(data, guild);
    };
    async function loadSong() {
      if (!data.music.queue[0]) return undefined;
      let { type, url } = data.music.queue[0], stream, title;
      if (type === 'soundcloud') {
        song = await scbi.getSongInfo(url);
        title = song.title.replace(/\'/g,"''");
        stream = await song.downloadProgressive();
      } else
        if (type === 'youtube') {
          song = ytdl.getBasicInfo(url);
          title = song.videoDetails.title.replace(/\'/g,"''");
          stream = await ytdl(url);
        };
      data.music.track = { title, type };
      await client.data.set(data, guild);
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
            info = await scbi.getSongInfo(url)
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
        }; no++;
        musicQueueEmbed.addFields(field);
      };
      return musicQueueEmbed;
    };
    function dynamicPlayerEmbed(song) {
      let playerState;
      switch (audioPlayer?._state.status) {
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
          value: (song.title) ? `${song.title.replace("''","'")}` : 'No song loaded.',
        }
      ];
      return musicPlayerEmbed;
    };
    // Update player interface from dynamic embed.
    async function refreshPlayer(interact) {
      try {
        await interact.editReply(
          {
            embeds: [dynamicPlayerEmbed(data.music.track)],
            components: [musicPlayerCtrlBtns, musicPlayerExtBtns],
          },
        );
      } catch (err) {
        logger.debug('Error opening/updating player interface!');
        logger.debug(err.stack);
      };
    };
    let queueOpen, playerOpen;
    audioPlayer = (!audioPlayer) ? newAudioPlayer() : audioPlayer;
    switch (subcmd) {
      case 'add':
        await verifySource(interaction.options.getString('url'));      
        await wait(3000);
        await interaction.deleteReply();
        break;
      case 'search':
        break;
      case 'player':
        collector = interaction.channel.createMessageComponentCollector({ time: 300000 });
        playerOpen = true;
        await refreshPlayer(interaction);
        break;
    };
    // Player Event Handler.
    audioPlayer.on('stateChange', (oldState, newState) => {
      logger.debug(`oldState.status => ${oldState?.status}`);
      logger.debug(`newState.status => ${newState?.status}`);
      if (playerOpen) refreshPlayer(interaction);
    });
    audioPlayer.on(AudioPlayerStatus.Playing, () => {
      logger.debug('Player has started playing!');
    });
    audioPlayer.on(AudioPlayerStatus.Idle, async () => {
      if (stopped) {
        return logger.debug('Player stopped by user! AutoPlay halted.');
      } else {
        logger.debug('Current song has finished, queuing up next song.');
      };
      data.music.queue.shift();
      data.music.track = {};
      await client.data.set(data, guild)
      source = await loadSong();
      if (!source) {
        logger.debug('No songs available. Awaiting new requests.');
      } else {
        logger.debug(`Song queued! Playing ${data.music.track.title} next.`);
        audioPlayer.play(source);
      };
    });
    audioPlayer.on(AudioPlayerStatus.AutoPaused, () => {
      audioPlayer.pause();
      logger.debug('Player auto paused since not connected. Waiting for connections.');
    });
    audioPlayer.on('error', err => {
      logger.error('Error occured while playing stream!');
      logger.error(err.message); logger.debug(err.stack);
      audioPlayer.stop();
    });
    // Menu/Button collecter and handler.
    if (collector) {
      collector.on('collect', async interact => {
        data = await client.data.get(interact.guild);
        await interact.deferUpdate();
        await wait(1000);
        // Button Switch/Case Handler
        switch (interact.customId) {
          case 'closePlayer':
            playerOpen = false;
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
                connection = null;
              };
            break;
          // Music Player Actions
          case 'play':
            if (!audioPlayer) return;
            source = await loadSong();
            if (!source) return interact.editReply({ content: 'No song queued to play!' });
            audioPlayer.play(source);
            connection.subscribe(audioPlayer);
            break;
          case 'pause':
            if (!audioPlayer) return;
            audioPlayer.pause();
            break;
          case 'stop':
            if (!audioPlayer) return;
            stopped = true;
            audioPlayer.stop();
            data.music.track = {};
            break;
          case 'skip':
            if (!audioPlayer) return;
            data.music.queue.shift();
            source = await loadSong();
            if (!source) {
              return interact.editReply({ content: 'End of queue!' });
            } else {
              audioPlayer.play(source);
            };
            break;
          case 'clear':
            data.music.queue = [];
            break;
          case 'queue':
            queueOpen = !queueOpen;
            if (queueOpen) {
              logger.debug(`Fetching queue for ${guild.name} (${guild.id})`);
              musicQueueEmbed.setDescription('Composing song list, this may take a while.');
              await interact.editReply(
                {
                  embeds: [musicQueueEmbed]
                }
              );
              musicQueueEmbed.setDescription('');
              await interact.editReply(
                {
                  embeds: [await dynamicQueueEmbed(data.music.queue)]
                }
              );
            } else {
              refreshPlayer(interact);
            };
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
        };
        await client.data.set(data, interact.guild);
      });
      collector.on('end', async collected => {
        logger.debug('Collector in music commmand timed out or was stopped.');
        logger.debug(`Collected ${collected.size} items.`);
        // don't edit replies if player is no longer open!
        if (!playerOpen) return;
        await interaction.editReply(
          {
            content: 'Music Player timed out. Please run /music again.',
            embeds: [], components: [],
          },
        );
        await wait(5000);
        await interaction.deleteReply();
        playerOpen = false;
      });
    } else {
      return;
    };
  },
};