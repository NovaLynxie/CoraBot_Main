
const logger = require('../../utils/winstonLogger');
const { longURL, shortURL } = require('../../utils/urlParser');
const { MessageActionRow, MessageAttachment, MessageButton, MessageEmbed, MessageSelectMenu } = require('discord.js');
const { SlashCommandBuilder, time } = require('@discordjs/builders');
const { AudioPlayerStatus } = require('@discordjs/voice');
const { Playing, Idle, Paused, AutoPaused } = AudioPlayerStatus;
const { stripIndents } = require('common-tags');
const playdl = require('play-dl');
playdl.getFreeClientID().then((clientID) => playdl.setToken({
  useragent: ['CoraBot/4.0 (https://github.com/NovaLynxie/CoraBot_Main)'],
  soundcloud: { client_id: clientID }
}));
const wait = require('util').promisify(setTimeout);
let audioPlayer, stopped = false;

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
            .setRequired(false)
        )
        .addStringOption(option =>
          option
            .setName('soundcloud')
            .setDescription('Search through Soundcloud.')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('player')
        .setDescription('Start up the player.')
    ),
  async execute(interaction, client) {
    if (!client.modules.enableMusicBot) {
      return interaction.reply({
        content: "MusicBot functionality disabled. `music` command is unavailable.", ephemeral: true
      });
    };
    await interaction.deferReply({ ephemeral: false });
    let guild = interaction.guild, member = interaction.member, collector, source, track, audioVolume;
    let connection = client.voice.player.fetch(guild), queuePage = 1;
    audioPlayer = (connection) ? connection._state.subscription ?.player : undefined;
    let voiceData = await client.data.voice.get(guild);
    const subcmd = interaction.options.getSubcommand();
    const musicBaseEmbed = new MessageEmbed()
      .setColor('#32527b')
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'Powered by DiscordJS Voice (OPUS)' });
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
          .setCustomId('vol-')
          .setEmoji('🔉')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('vol+')
          .setEmoji('🔊')
          .setStyle('SECONDARY')
      );
    const musicPlayerCtrlBtns2 = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('restart')
          .setEmoji('⏮')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('rewind')
          .setEmoji('⏪')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('fastfoward')
          .setEmoji('⏩')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('skip')
          .setEmoji('⏭️')
          .setStyle('SECONDARY')
      );
    const musicPlayerExtBtns = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('joinLeaveVC')
          .setEmoji('🎤')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('skip')
          .setEmoji('⏭️')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('clearQueue')
          .setEmoji('🆑')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('queueMenu')
          .setEmoji('📜')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('closePlayer')
          .setEmoji('❌')
          .setStyle('SECONDARY')
      );
    const musicQueueMenuBtns = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('pagePrev')
          .setEmoji('⬅️')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('pageNext')
          .setEmoji('➡️')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('clearQueue')
          .setEmoji('🆑')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('queueMenu')
          .setEmoji('📜')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('closePlayer')
          .setEmoji('❌')
          .setStyle('SECONDARY')
      );
    function formatDuration(time) {
      let hours, minutes, seconds;
      if (typeof time === 'string') time = parseInt(time, 10);
      hours = Math.floor(time / 3600);
      minutes = Math.floor((time - (hours * 3600)) / 60);
      seconds = time - (hours * 3600) - (minutes * 60);
      if (hours < 10) { hours = `0${hours}` };
      if (minutes < 10) { minutes = `0${minutes}` };
      if (seconds < 10) { seconds = `0${seconds}` };
      return `${(hours > 0) ? `${hours}:` : ''}${minutes}:${seconds}`;
    };
    async function playlistParser(url, type) {
      let hidden, playlist, queue = [];
      try {
        if (type === 'yt') playlist = await playdl.playlist_info(url, { incomplete: true });
        if (type === 'so') playlist = await playdl.soundcloud(url);
      } catch (error) {
        logger.error('Failed to fetch playlist information!');
        logger.error(error.message); logger.debug(error.stack);
        throw error;
      };
      logger.verbose(`playlist:${JSON.stringify(playlist, null, 2)}`);
      if (playlist.tracks) {
        let tracks = await playlist.all_tracks(); let song;
        for (let item of tracks) {
          if (!item.fetched) {
            logger.debug(`Skipped track ${item.title} as SC_TRACK_INCOMPLETE.`);
            continue;
          };
          logger.verbose(JSON.stringify(item, null, 2));
          queue.push({ title: item.name, duration: item.durationInSec, url: item.url, thumbnail: item.thumbnail, type: 'soundcloud', memberID: member.id });
        };
      };
      if (playlist.videos) {
        let videos = await playlist.all_videos();
        logger.verbose(`videos:${JSON.stringify(videos, null, 2)}`);
        for (let item of videos) {
          if (item.upcoming) {
            logger.debug('Unsupported type YOUTUBE_UPCOMING!');
            logger.debug(`Skipped video ${item.title} as  'YT_PREMIERE/UPCOMING'.`);
            continue;
          };
          if (item.live || item.durationInSec <= 0) {
            logger.debug('Unsupported type YOUTUBE_LIVESTREAM!');
            logger.debug(`Skipped video entry ${item.title} as 'YT_LIVESTREAM'.`);
          };
          logger.verbose(JSON.stringify(item, null, 2));
          queue.push({ title: item.title, duration: item.durationInSec, url: item.url, thumbnail: item.thumbnails[item.thumbnails.length - 1].url, type: 'youtube', memberID: member.id });
        };
        hidden = playlist.videoCount - queue.length;
      };
      logger.debug(`Parsed ${queue.length} songs! Adding them to music list.`);
      logger.verbose(`queue:${JSON.stringify(queue, null, 2)}`);
      return { queue, hidden };
    };
    async function sourceParser(url) {
      voiceData = await client.data.voice.get(guild);
      let data, song, list, response = {
        content: 'sourceParser.placeholder.message',
        embeds: [], components: [],
        ephemeral: true
      };
      logger.debug(`Verifying ${url}`);
      try {
        switch (await playdl.validate(url)) {
          case 'yt_playlist':
            data = await playlistParser(url, 'yt'); list = data.queue;
            response.content = `Queued ${list.length} songs from YouTube playlist! ${(data.hidden) ? `Skipped ${data.hidden} hidden songs.` : ''}`;
            break;
          case 'so_playlist':
            data = await playlistParser(url, 'so'); list = data.queue;
            response.content = `Queued ${list.length} songs from SoundCloud playlist!`;
            break;
          case 'yt_video':
            data = await playdl.video_info(url);
            let { video_details } = data;
            if (video_details.upcoming) {
              song = null;
              response.content = `Looks like you tried to add an upcoming YouTube premiere! You should be able to add this after ${time(video_details.upcoming)}.`
            } else if (video_details.durationInSec <= 0) {
              song = null;
              response.content = 'Sorry, I do not allow playback of YouTube livestreams in music player.';
            } else {
              song = { title: video_details.title, url: video_details.url, duration: video_details.durationRaw || video_details.durationInSec, thumbnail: video_details.thumbnails[0].url, type: 'youtube', memberID: member.id };
              response.content = `Added ${song.title} to the queue!`;
            };
            break;
          case 'so_track':
            data = await playdl.soundcloud(url);
            logger.data(JSON.stringify(data, null, 2));
            song = { title: data.name, duration: data.durationInSec, url: data.url, thumbnail: data.thumbnail, type: 'soundcloud', memberID: member.id };
            response.content = `Added ${song.title} to the queue!`;
            break;            
          default:
            logger.debug('That song URL is either unsupported or from an unrecognised source!');
            response.content = 'Unsupported or malformed song URL! Please check that the URL is valid and try again.';
            return;
        };
      } catch (error) {
        logger.error('Something went wrong while parsing the song request!');
        logger.error(error.message); logger.debug(error.stack);
        response = {
          content: `Error occured while processing request! \`\`\`xl\n${error.message}\`\`\``,
          embeds: [], components: [],
          ephemeral: true
        };
      };
      if (song) voiceData.music.queue.push(song);
      if (list) voiceData.music.queue = voiceData.music.queue.concat(list);
      logger.verbose(`voiceData:${JSON.stringify(voiceData, null, 2)}`);
      await client.data.voice.set(guild, voiceData);
      interaction.editReply(response);
    };
    async function loadSong() {
      if (!voiceData.music.queue[0]) return undefined;
      let { title, duration, type, url, thumbnail } = voiceData.music.queue[0];
      const source = await playdl.stream(url);
      const stream = client.voice.player.create(source.stream, {
        metadata: { title: title },
        type: source.type, volume: voiceData.volume
      });
      voiceData.music.track = { title, duration, type, thumbnail };
      await client.data.voice.set(guild, voiceData);
      return stream;
    };
    async function dynamicQueueEmbed(queue, index = 1) {
      let no = 1, field = {}, info, pos = index * 25 - 24;
      let section = queue.slice(pos - 1, pos + 24); no = pos;
      if (section.length <= 0) {
        logger.debug('No more songs detected! Staying on previous page');
        queuePage = index - 1; pos = (queuePage) * 25 - 24; no = pos;
        section = queue.slice(pos - 1, pos + 24);
      };
      let queueEmbed = new MessageEmbed(musicBaseEmbed)
        .setTitle('Music Player Queue 🎼')
        .setDescription(`
        ${guild.name}'s queued songs
        ${(section.length) ? (section.length > 24) ? pos + (section.length - 25) : pos : 0} - ${(section.length <= 24) ? queue.length : pos + 24} of ${queue.length}`);
      logger.verbose(`queue.main.length=${queue.length}`);
      logger.verbose(`queue.section.length=${section.length}`);
      logger.verbose(`pageNo:${index}; posNo:${pos};`)
      for (const item of section) {
        let { title, duration, type, url, memberID } = item;
        try {
          switch (type) {
            case "youtube":
              field = {
                name: `Track #${no}`,
                value: `
                Title: ${title}
                Duration: ${(typeof duration === 'string') ? duration : formatDuration(duration)}
                Requested by ${guild.members.resolve(memberID) || 'Unknown'}
                Sourced from YouTube`
              };
              break;
            case "soundcloud":
              field = {
                name: `Track #${no}`,
                value: `
                Title: ${title}
                Duration: ${(typeof duration === 'string') ? duration : formatDuration(duration)}
                Requested by ${guild.members.resolve(memberID) || 'Unknown'}
                Sourced from SoundCloud`
              };
              break;
            default:
              field = {
                name: `Track #${no}`,
                value: `
                No information available.
                URL: ${url}`
              };
          }; no++;
        } catch (err) {
          logger.error(`Failed to load music queue for ${guild.name}!`);
          logger.debug(`Guild ${guild.name} (id:${guild.id}) has corrupted or invalid music queue data!`);
          logger.debug(`Song entry at position ${no} is invalid and will be skipped during playback.`);
          logger.debug(err.stack);
          field = {
            name: `Track #${no}`,
            value: `
            Unable to load queued song information!`
          };
        }; queueEmbed.addFields(field);
      };
      if (queueEmbed.fields.length <= 0) {
        queueEmbed.fields = [];
        queueEmbed.addField('This queue is empty!', "No songs in this guild's queue yet. Add a song by searching by keywords or with its URL!");
      }; return queueEmbed;
    };
    function dynamicSearchEmbed(list, query) {
      let searchEmbed = new MessageEmbed(musicBaseEmbed)
        .setTitle('Music Searcher 🔍')
        .setDescription(stripIndents`
        Here are some matching entries from your keywords.
        \`\`\`
        Source: ${query.source}
        Keywords: ${query.keywords}
        \`\`\`
        Please select the entry to add using the selection box below.`);
      let count = 1;
      list.forEach(song => {
        searchEmbed.addField(`Song ${count}`, song.title || song.name);
        count++;
      }); return searchEmbed;
    };
    async function dynamicSearchSelector(list, type) {
      let selection = [], url;
      for (const song of list) {
        switch (type) {
          case 'soundcloud':
            url = (song.url.length < 100) ? song.url : await shortURL(song.url);
            break;
          case 'youtube':
            url = `https://www.youtube.com/watch?v=${song.id}`
            break;
          default:
            url = undefined;
        };
        let item = { label: song.title || song.name, value: url };
        logger.data(`parsing results item ${JSON.stringify(item)}`);
        selection.push(item);
      };
      selection.push({ label: 'Cancel Search', value: 'search_abort' });
      let searchSelector = new MessageActionRow()
        .addComponents(
          new MessageSelectMenu()
            .setCustomId('musicSearchSelect')
            .setPlaceholder('Select your song.')
            .addOptions(selection)
        )
      return searchSelector;
    };
    function dynamicPlayerEmbed(song) {
      let playerState, playerEmbed = new MessageEmbed(musicBaseEmbed);
      playerEmbed.setTitle('Music Player 🎶');
      if (song.thumbnail) playerEmbed.setThumbnail(song.thumbnail);
      switch (audioPlayer ?._state.status) {
        case 'idle':
          playerState = 'Idle'; break;
        case 'buffering':
          playerState = 'Loading...'; break;
        case 'playing':
          playerState = 'Playing'; break;
        case 'autopaused':
          playerState = 'Paused (AUTO)'; break;
        case 'paused':
          playerState = 'Paused'; break;
        default:
          if (!source) {
            playerState = 'No Track'
          } else {
            playerState = 'Player Off';
          };
      };
      if (!connection) playerState = 'Voice D/C 🔇';
      playerEmbed.fields = [
        {
          name: 'Player Status',
          value: (playerState) ? playerState : '...',
        },
        {
          name: 'Song Information',
          value: `${(song) ? `${(song.title) ? `${song.title.replace("''", "'")}` : 'unknown'} (${(song.type) ? song.type : 'unknown'})` : '...'} (${(song.duration ? (typeof song.duration === 'string') ? song.duration : formatDuration(song.duration) : '--:--')})`, inline: true
        },
        {
          name: 'Volume', value: `${Math.round(voiceData.volume * 100)}%`, inline: true
        }
      ]; return playerEmbed;
    };
    async function searchQuery(query) {
      let results, searchOptions = { source: {} };
      let sites = { youtube: 'YouTube', soundcloud: 'SoundCloud' };
      let startEmbed = new MessageEmbed(musicBaseEmbed)
        .setTitle('Music Searcher 🔍')
        .setDescription(`Searching for songs matching \`${query.keywords}\` on ${sites[query.source]}.`);
      await interaction.editReply({ embeds: [startEmbed] });
      switch (query.source) {
        case 'youtube':
          searchOptions.source = { youtube: 'video' };
          results = await playdl.search(query.keywords, searchOptions);
          break;
        case 'soundcloud':
          searchOptions.source = { soundcloud: 'tracks' };
          results = await playdl.search(query.keywords, searchOptions);
          break;
        default:
          logger.debug('Unknown or unrecognised search source parameter!');
      };
      if (!results) {
        await interaction.editReply({
          content: 'Whoops! No response was received or failed to get search results! Try searching again.'
        });
      } else {
        await interaction.editReply({
          components: [await dynamicSearchSelector(results.items || results, query.source)],
          embeds: [await dynamicSearchEmbed(results.items || results, query)]
        });
      };
    };
    async function refreshPlayer(interact) {
      logger.verbose(JSON.stringify(voiceData, null, 2));
      try {
        await interact.editReply({
          components: [musicPlayerCtrlBtns, musicPlayerExtBtns],
          embeds: [dynamicPlayerEmbed(voiceData.music.track)],
        });
      } catch (err) {
        logger.debug('Error opening/updating player interface!');
        logger.debug(err.stack);
      };
    };
    let queueOpen, playerOpen;
    audioPlayer = (!audioPlayer) ? client.voice.player.init() : audioPlayer;
    switch (subcmd) {
      case 'add':
        await sourceParser(interaction.options.getString('url'));
        break;
      case 'search':
        let ytQuery = interaction.options.getString('youtube');
        let scQuery = interaction.options.getString('soundcloud');
        if (!ytQuery && !scQuery) return interaction.editReply({
          content: 'Cannot search with an empty input!'
        });
        if (scQuery) await searchQuery({ keywords: scQuery, source: 'soundcloud' });
        if (ytQuery) await searchQuery({ keywords: ytQuery, source: 'youtube' });
        collector = interaction.channel.createMessageComponentCollector({ time: 300000 });
        break;
      case 'player':
        collector = interaction.channel.createMessageComponentCollector({ time: 300000 });
        playerOpen = true;
        await refreshPlayer(interaction);
        break;
    };
    // TODO: Add automatic song announcer functions! (experimental)
    function songAnnouncer() {
      let announceEmbed = new MessageEmbed(musicBaseEmbed)
        .setTitle('Now Playing!')
        .setDescription(`${voiceData.music.track.title}`)
        .setThumbnail(voiceData.music.track.thumbnail)
      guild.me.voice.channel.send({ embeds: [announceEmbed] });
    };
    // TODO: Integrate automatic song announcer into code! (experimental)
    async function nextSong() {
      voiceData.music.queue.shift(); voiceData.music.track = {};      
      source = await loadSong();
      if (!source) {
        logger.debug('No songs available! AudioPlayer stopped.');
      } else {
        logger.debug(`Song queued! Playing ${voiceData.music.track.title} next.`);
        audioPlayer.play(source);
      };
      await client.data.voice.set(guild, voiceData); songAnnouncer();
    };
    const playerEvents = {
      playEvent: () => { logger.debug('Player has started playing!') },
      idleEvent: async () => {
        logger.debug('Player has stopped playing!');
        voiceData = await client.data.voice.get(guild);
        if (stopped) {
          stopped = false;
          return logger.debug('Player stopped by user! AutoPlay aborted.');
        } else {
          logger.debug('Current song has finished, queuing up next song.');
        };
        await nextSong();
      },
      autoPauseEvent: () => {
        logger.debug('Player autopaused since not connected to an active channel.');
      },
      pauseEvent: () => { logger.debug('Player was paused.') },
      stateChangeEvent: (oldState, newState) => {
        logger.debug(`oldState.status => ${oldState ?.status}`);
        logger.debug(`newState.status => ${newState ?.status}`);
        if (playerOpen) refreshPlayer(interaction);
      },
      errorEvent: async (error) => {
        logger.error('Error thrown by AudioPlayer during playback!');
        logger.error(`${error.message} while playing audio resource ${error.resource.metadata.title}!`);
        logger.debug(error.stack); logger.verbose(error);
        await nextSong();
      }
    };
    const eventListenerCheck = (event) => audioPlayer.listenerCount(event) <= 0;
    const eventListenerReset = (event, callback) => {
      audioPlayer.removeAllListeners(event);
      audioPlayer.addListener(event, callback);
    };
    if (eventListenerCheck(Idle)) {
      audioPlayer.on(Idle, playerEvents.idleEvent);
    } else { eventListenerReset(Idle, playerEvents.idleEvent) };
    if (eventListenerCheck(AutoPaused)) {
      audioPlayer.on(AutoPaused, playerEvents.autoPauseEvent);
    } else { eventListenerReset(AutoPaused, playerEvents.autoPauseEvent) };
    if (eventListenerCheck(Playing)) {
      audioPlayer.on(Playing, playerEvents.playEvent);
    } else { eventListenerReset(Playing, playerEvents.playEvent) };
    if (eventListenerCheck(Paused)) {
      audioPlayer.on(Paused, playerEvents.pauseEvent);
    } else { eventListenerReset(Paused, playerEvents.pauseEvent) };
    if (eventListenerCheck('stateChange')) {
      audioPlayer.on('stateChange', playerEvents.stateChangeEvent);
    } else { eventListenerReset('stateChange', playerEvents.stateChangeEvent) };
    if (eventListenerCheck('error')) {
      audioPlayer.on('error', playerEvents.errorEvent);
    } else { eventListenerReset('error', playerEvents.errorEvent) };
    function errCallback(interact) {
      let errEmbed = new MessageEmbed(musicBaseEmbed)
        .setTitle('Playback Error!')
        .setDescription(stripIndents`
          Error loading song ${voiceData.music.track.title}!
          This song may be unavailable or does not exist.
        `);
      interact.followUp({ embeds: [errEmbed], ephemeral: true });
    };
    if (collector) {
      collector.on('collect', async interact => {
        voiceData = await client.data.voice.get(interact.guild);
        await interact.deferUpdate();
        await wait(1000);
        try {
          switch (interact.customId) {
            case 'closePlayer':
              playerOpen = false;
              await interact.editReply({
                content: 'Music Player hidden! Run /music player to reopen it.',
                embeds: [], components: [],
              });
              await wait(5000);
              await interact.deleteReply();
              collector.stop(); break;
            case 'musicSearchSelect':
              if (interact.values[0] === 'search_abort') {
                interact.editReply({
                  components: [], embeds: [],
                  content: 'Song search cancelled!'
                });
                await wait(5000); interact.deleteReply();
              };
              await sourceParser(interact.values[0]);
              collector.stop();
              break;
            case 'joinLeaveVC':
              if (!interaction.member.voice.channel) {
                interact.followUp({
                  content: 'You are not in a voice channel! Please join one first!',
                  ephemeral: true,
                });
              };
              if (!connection) {
                connection = await client.voice.player.join(interaction.member.voice.channel);
                await connection.subscribe(audioPlayer);
              } else {
                try {
                  connection.destroy();
                  connection = null;
                } catch (error) {
                  logger.debug('Connection is already destroyed!');
                  logger.debug(error.message); logger.debug(error.stack);
                  connection = null;
                };
              }; refreshPlayer(interact); break;
            case 'play':
              if (!audioPlayer) return;
              try {
                source = await loadSong();
              } catch (error) {
                logger.error('Failed to load song!');
                logger.error(error.message); logger.debug(error.stack);
                errCallback(interact);
              };
              if (!source) return interact.editReply({ content: 'No song queued to play!' });
              if (!interaction.member.voice.channel) {
                interact.followUp({
                  content: 'You are not in a voice channel! Please join one first!',
                  ephemeral: true,
                });
              };
              audioPlayer.play(source);
              if (!connection) break;
              connection.subscribe(audioPlayer); break;
            case 'pause':
              if (!audioPlayer) return;
              if (audioPlayer ?._state.status === Paused) {
                audioPlayer.unpause();
              } else if (audioPlayer ?._state.status === Playing) {
                audioPlayer.pause();
              }; break;
            case 'stop':
              if (!audioPlayer) return;
              stopped = true; audioPlayer.stop();
              voiceData.music.track = {}; break;
            case 'skip':
              if (!audioPlayer) return; voiceData.music.queue.shift();
              try { source = await loadSong() } catch (error) {
                logger.error('Failed to load song!');
                logger.error(error.message); logger.debug(error.stack);
                errCallback(interact);
              };
              if (!source) {
                return interact.editReply({ content: 'End of queue!' });
              } else { audioPlayer.play(source) }; break;
            case 'vol+':
              if (!audioPlayer ?._state ?.resource.volume) return;
              audioVolume = audioPlayer ?._state ?.resource.volume;
              voiceData.volume = voiceData.volume + 0.05;
              if (voiceData.volume >= 1.0) voiceData.volume = 0.1;
              audioVolume.setVolume(voiceData.volume);
              logger.debug(`Set volume of audioPlayer to ${Math.round(voiceData.volume * 100)}%`);
              refreshPlayer(interact); break;
            case 'vol-':
              if (!audioPlayer ?._state ?.resource.volume) return;
              audioVolume = audioPlayer ?._state ?.resource.volume;
              voiceData.volume = voiceData.volume - 0.05;
              if (voiceData.volume <= 0.05) voiceData.volume = 0.05;
              audioVolume.setVolume(voiceData.volume);
              logger.debug(`Set volume of audioPlayer to ${Math.round(voiceData.volume * 100)}%`);
              refreshPlayer(interact);
              break;
            case 'clearQueue':
              voiceData.music.queue = [];
              if (queueOpen) {
                await interact.editReply(
                  { embeds: [await dynamicQueueEmbed(voiceData.music.queue, 0)], components: [musicQueueMenuBtns] }
                );
              }; break;
            case 'queueMenu':
              queueOpen = !queueOpen;
              if (queueOpen) {
                playerOpen = false;
                logger.debug(`Fetching queue for ${guild.name} (${guild.id})`);
                await interact.editReply(
                  { embeds: [await dynamicQueueEmbed(voiceData.music.queue, queuePage)], components: [musicQueueMenuBtns] }
                );
              } else {
                playerOpen = true; queuePage = 1; refreshPlayer(interact);
              }; break;
            case 'pageNext':
              queuePage++;
              await interact.editReply(
                { embeds: [await dynamicQueueEmbed(voiceData.music.queue, queuePage)], components: [musicQueueMenuBtns] }
              ); break;
            case 'pagePrev':
              queuePage--; queuePage = (queuePage < 1) ? 1 : queuePage;
              await interact.editReply(
                { embeds: [await dynamicQueueEmbed(voiceData.music.queue, queuePage)], components: [musicQueueMenuBtns] }
              ); break;
            default:
              logger.warn('Invalid or unknown action called!');
              logger.verbose('music.button.default.trigger');
              await interact.editReply({
                content: 'That action is invalid or not available!',
              });
          };
        } catch (err) {
          logger.error(err.message); logger.debug(err.stack);
        };
        await client.data.voice.set(interact.guild, voiceData);
      });
      collector.on('end', async collected => {
        logger.debug('Collector in music commmand timed out or was stopped.');
        logger.debug(`Collected ${collected.size} items.`);
        if (!playerOpen) return;
        await interaction.editReply({
          content: 'Music player menu closed. Please run /music again.',
          embeds: [], components: [],
        });
        await wait(5000); playerOpen = false;
        if (subcmd === 'player') await interaction.deleteReply();
        await client.data.voice.set(interact.guild, voiceData);
      });
    } else return;
  },
};