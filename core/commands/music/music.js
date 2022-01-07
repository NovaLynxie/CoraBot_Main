const logger = require('../../utils/winstonLogger');
const { longURL, shortURL } = require('../../utils/urlParser');
const { MessageActionRow, MessageAttachment, MessageButton, MessageEmbed, MessageSelectMenu } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');
const { Playing, Idle, Paused, AutoPaused } = AudioPlayerStatus;
const { SlashCommandBuilder } = require('@discordjs/builders');
const playdl = require('play-dl');
playdl.getFreeClientID().then((clientID) => playdl.setToken({
  soundcloud: {
    client_id: clientID
  }
}));
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
    await interaction.deferReply({ ephemeral: false });
    let guild = interaction.guild, collector, source, track;
    let connection = checkVC(guild);
    let voiceData = await client.data.guild.voice.get(guild);
    const subcmd = interaction.options.getSubcommand();
    const musicBaseEmbed = new MessageEmbed()
      .setColor('#32527b')
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setFooter('Powered by DiscordJS Voice (OPUS)');
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
          .setCustomId('vol+')
          .setEmoji('🔉')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('vol-')
          .setEmoji('🔊')
          .setStyle('SECONDARY'),
      );
    const musicPlayerCtrlBtns2 = new MessageActionRow()
      .addComponents(
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
    const musicQueueMenuBtns = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('clear')
          .setEmoji('🆑')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('queue')
          .setEmoji('📜')
          .setStyle('SECONDARY'),
      );
    async function playlistParser(url, type) {
      let playlist, queue = [];
      if (type === 'yt') playlist = await playdl.playlist_info(url);
      if (type === 'so') playlist = await playdl.soundcloud(url);
      logger.verbose(`playlist:${JSON.stringify(playlist, null, 2)}`);
      if (playlist.tracks) {
        playlist.tracks.forEach(async (item, index, array) => {
          logger.debug(`Parsed song ${index} of ${playlist.tracks.length}`);
          let song = item;
          if (!song.fetched) song.url = `https://api.soundcloud.com/tracks/${item.id}`;
          logger.verbose(JSON.stringify(song, null, 2));
          queue.push({ url: song.url, type: 'soundcloud' });
          logger.debug(`Parsed song ${index} of ${array.length}`);
        });
      };
      if (playlist.videos) {
        playlist.videos.forEach(async (item, index, array) => {
          logger.verbose(JSON.stringify(item, null, 2));
          queue.push({ url: item.url, type: 'youtube' });
          logger.debug(`Parsed song ${index} of ${array.length}`);
        });
      };
      return queue;
    };
    async function sourceParser(url) {
      voiceData = await client.data.guild.voice.get(guild);
      let data, song, list, response = {
        content: 'sourceParser.placeholder.message',
        embeds: [], components: [],
        ephemeral: true
      };
      logger.debug(`Verifying ${url}`);
      switch (await playdl.validate(url)) {
        case 'yt_playlist':
          list = await playlistParser(url, 'yt');
          response.content = `Queued ${list.length} songs from YouTube playlist!`;
          break;
        case 'so_playlist':
          list = await playlistParser(url, 'so');
          response.content = `Queued ${list.length} songs from SoundCloud playlist!`;
          break;
        case 'yt_video':
          data = await playdl.video_info(url);
          logger.data(JSON.stringify(data, null, 2));
          song = { title: data.video_details.title, url: data.video_details.url, thumbnail: data.video_details.thumbnail.url, type: 'youtube' };
          response.content = `Added ${song.title} to the queue!`;
          break;
        case 'so_track':
          data = await playdl.soundcloud(url);
          logger.data(JSON.stringify(data, null, 2));
          song = { title: data.name, url: data.url, thumbnail: data.thumbnail, type: 'soundcloud' };
          break;
          response.content = `Added ${song.title} to the queue!`;
        default:
          logger.debug('That song URL is either unsupported or from an unrecognised source!');
          response.content = 'Unsupported or malformed song URL! Please check that the URL is valid and try again.';
          return;
      };
      if (song) voiceData.music.queue.push(song);
      if (list) voiceData.music.queue = voiceData.music.queue.concat(list);
      logger.verbose(`voiceData:${JSON.stringify(voiceData, null, 2)}`);
      await client.data.guild.voice.set(voiceData, guild);
      interaction.editReply(response);
    };
    async function loadSong() {
      if (!voiceData.music.queue[0]) return undefined;
      let { title, type, url } = voiceData.music.queue[0];
      const source = await playdl.stream(url);
      const stream = createSource(source.stream);
      voiceData.music.track = { title, type };
      await client.data.guild.voice.set(voiceData, guild);
      return stream;
    };
    // Dynamic Music Embeds
    async function dynamicQueueEmbed(queue) {
      let queueEmbed = new MessageEmbed(musicBaseEmbed);
      queueEmbed
        .setTitle('Music Player Queue 🎼')
        .setDescription(`${guild.name}'s queued songs`);
      let field = {}, no = 1, info;
      for (const item of queue) {
        let { type, url } = item;
        try {
          switch (type) {
            case "youtube":
              info = await playdl.video_info(url);
              field = {
                name: `Track #${no}`,
                value: `
                Title: ${info.title}
                Duration: ${info.durationRaw}
                Sourced from YouTube`
              };
              break;
            case "soundcloud":
              info = await playdl.soundcloud(url);
              time = info.durationInSec;
              mins = Math.floor(time / 60); secs = time - mins * 60;
              field = {
                name: `Track #${no}`,
                value: `
                Title: ${info.name}
                Duration: ${mins}:${secs}
                Sourced from SoundCloud`
              };
              break;
            default:
              field = {
                name: `Track #${no}`,
                value: `
                No information available.
                URL: ${url}
                `
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
          }
        }
        queueEmbed.addFields(field);
      };
      if (queueEmbed.fields.length <= 0) {
        queueEmbed.fields = [];
        queueEmbed.addField('This queue is empty!', "No songs in this guild's queue yet. Add a song by searching by keywords or with its URL!");
      };
      return queueEmbed;
    };
    function dynamicSearchEmbed(list) {
      let searchEmbed = new MessageEmbed(musicBaseEmbed)
        .setTitle('Music Searcher 🔍')
        .setDescription(`
        Here are some matching entries from your keywords.
        Please select the entry to add using the selection box below.`);
      let count = 1;
      list.forEach(song => {
        searchEmbed.addField(`Song ${count}`, song.title || song.name);
        count++;
      });
      return searchEmbed;
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
        let item = {
          label: song.title || song.name,
          value: url
        };
        logger.data(`parsing results item ${JSON.stringify(item)}`);
        selection.push(item);
      };
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
      switch (audioPlayer ?._state.status) {
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
        case 'paused':
          playerState = 'Paused';
          break;
        default:
          playerState = 'Invalid State!';
      };
      if (!source) playerState = 'No Song Loaded!';
      if (!connection) playerState = 'Voice D/C 🔇';
      playerEmbed.fields = [
        {
          name: 'Player Status',
          value: (playerState) ? playerState : '...',
        },
        {
          name: 'Song Information',
          value: `${(song.title) ? `${song.title.replace("''", "'")} (${song.type})` : '...'}`,
        }
      ];
      return playerEmbed;
    };
    async function searchQuery(query) {
      let results, searchOptions = { source: {} };
      let sites = { youtube: 'YouTube', soundcloud: 'SoundCloud' };
      let startEmbed = new MessageEmbed(musicBaseEmbed)
        .setTitle('Music Searcher 🔍')
        .setDescription(`Searching for songs matching \`${query.keywords}\` on ${sites[query.source]}.`);
      await interaction.editReply({
        embeds: [startEmbed]
      });
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
        // ..
      };
      if (!results) {
        await interaction.editReply({
          content: 'Whoops! No response was received or failed to get search results! Try searching again.'
        }); return;
      };
      await interaction.editReply({
        components: [await dynamicSearchSelector(results.items || results, query.source)],
        embeds: [await dynamicSearchEmbed(results.items || results)]
      });
    };
    // Update player interface from dynamic embed.
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
    audioPlayer = (!audioPlayer) ? newAudioPlayer() : audioPlayer;
    switch (subcmd) {
      case 'add':
        await sourceParser(interaction.options.getString('url'));
        await wait(3000);
        await interaction.deleteReply();
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
    // Player Event Handler.
    const eventListenerCheck = (event) => audioPlayer.listenerCount(event) < 1;
    if (eventListenerCheck(Playing)) {
      audioPlayer.on(Playing, () => {
        logger.debug('Player has started playing!');
      });
    };
    if (eventListenerCheck(Idle)) {
      audioPlayer.on(Idle, async () => {
        logger.debug('Player has stopped playing!');
        voiceData = await client.data.guild.voice.get(guild);
        if (stopped) {
          stopped = false;
          return logger.debug('Player stopped by user! AutoPlay aborted.');
        } else {
          logger.debug('Current song has finished, queuing up next song.');
        };
        voiceData.music.queue.shift();
        voiceData.music.track = {};
        source = await loadSong();
        if (!source) {
          logger.debug('No songs available! AudioPlayer stopped.');
        } else {
          logger.debug(`Song queued! Playing ${voiceData.music.track.title} next.`);
          audioPlayer.play(source);
        };
        await client.data.guild.voice.set(voiceData, guild);
      });
    };
    if (eventListenerCheck(AutoPaused)) {
      audioPlayer.on(AutoPaused, () => {
        logger.debug('Player autopaused since not connected to an active channel.');
      });
    };
    if (eventListenerCheck(Paused)) {
      audioPlayer.on(Paused, () => {
        logger.debug('Player was paused by user request!');
      });
    };
    if (eventListenerCheck('stateChange')) {
      audioPlayer.on('stateChange', (oldState, newState) => {
        logger.debug(`oldState.status => ${oldState ?.status}`);
        logger.debug(`newState.status => ${newState ?.status}`);
        if (playerOpen) refreshPlayer(interaction);
      });
    };
    if (eventListenerCheck('error')) {
      audioPlayer.on('error', err => {
        logger.error('Error occured while playing stream!');
        logger.error(err.message); logger.debug(err.stack);
        logger.verbose(err);
        audioPlayer.stop();
      });
    };
    // Menu/Button collecter and handler.
    if (collector) {
      collector.on('collect', async interact => {
        voiceData = await client.data.guild.voice.get(interact.guild);
        logger.verbose(JSON.stringify(voiceData, null, 2));
        await interact.deferUpdate();
        await wait(1000);
        // Interaction Collector Switch/Case Handler
        try {
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
            // Search Result Handler
            case 'musicSearchSelect':
              await sourceParser(interact.values[0]);
              await wait(3000);
              await interaction.deleteReply();
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
              refreshPlayer(interact);
              break;
            // Music Player Actions
            case 'play':
              if (!audioPlayer) return;
              source = await loadSong();
              if (!source) return interact.editReply({ content: 'No song queued to play!' });
              if (!interaction.member.voice.channel) {
                interact.followUp({
                  content: 'You are not in a voice channel! Please join one first!',
                  ephemeral: true,
                });
              };
              audioPlayer.play(source);
              if (!connection) break;
              connection.subscribe(audioPlayer);
              break;
            case 'pause':
              if (!audioPlayer) return;
              if (audioPlayer ?._state.status === Paused) {
                audioPlayer.unpause();
              } else if (audioPlayer ?._state.status === Playing) {
                audioPlayer.pause();
              };
              break;
            case 'stop':
              if (!audioPlayer) return;
              stopped = true;
              audioPlayer.stop();
              voiceData.music.track = {};
              break;
            case 'skip':
              if (!audioPlayer) return;
              voiceData.music.queue.shift();
              source = await loadSong();
              if (!source) {
                return interact.editReply({ content: 'End of queue!' });
              } else {
                audioPlayer.play(source);
              };
              break;
            case 'clear':
              voiceData.music.queue = [];
              break;
            case 'queue':
              queueOpen = !queueOpen;
              if (queueOpen) {
                playerOpen = false;
                let loadingEmbed = new MessageEmbed(musicBaseEmbed)
                logger.debug(`Fetching queue for ${guild.name} (${guild.id})`);
                loadingEmbed
                  .setTitle(`Queued Songs for ${guild.name}`)
                  .setDescription(`
                  Composing song queue, please be patient.
                  *This may take a while if more than 25 songs are queued at a time.*`);
                await interact.editReply(
                  { embeds: [loadingEmbed] }
                );
                loadingEmbed.setDescription('');
                await interact.editReply(
                  { embeds: [await dynamicQueueEmbed(voiceData.music.queue)] }
                );
              } else {
                refreshPlayer(interact);
                playerOpen = true;
              };
              break;
            default:
              logger.warn('Invalid or unknown action called!');
              logger.verbose('music.button.default.trigger');
              await interact.editReply({
                content: 'That action is invalid or not available!',
              });
          }; await client.data.guild.voice.set(voiceData, interact.guild);
        } catch (err) {
          logger.error(err.message); logger.debug(err.stack);
        };
      });
      collector.on('end', async collected => {
        logger.debug('Collector in music commmand timed out or was stopped.');
        logger.debug(`Collected ${collected.size} items.`);
        if (!playerOpen) return;
        await interaction.editReply({
          content: 'Music Player timed out. Please run /music again.',
          embeds: [], components: [],
        });
        await wait(5000);
        await interaction.deleteReply();
        playerOpen = false;
      });
    } else {
      return;
    };
  },
};