const logger = require('../../utils/winstonLogger');
const { longURL, shortURL } = require('../../utils/urlParser');
const { credentials } = require('../../handlers/bootLoader');
const { MessageActionRow, MessageAttachment, MessageButton, MessageEmbed, MessageSelectMenu } = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');
const { Playing, Idle, Paused, AutoPaused } = AudioPlayerStatus;
const { SlashCommandBuilder } = require('@discordjs/builders');
const SoundCloud = require('soundcloud-scraper');
const ytsa = require('youtube-search-api');
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
    async function soundcloudSongsParser(url) {
      let playlist = await scbi.getPlaylist(url); let queue = [], object = {};
      interaction.editReply({
        content: 'SoundCloud playlist detected! Parsing songs...',
        ephemeral: true
      });
      playlist.tracks.forEach(track => {
        if (!track.permalink_url) return logger.debug('Skipped track  due to incomplete/malformed response.');
        object = { type: 'soundcloud', url: track.permalink_url };
        queue.push(object);
      });
      interaction.editReply({
        content: 'Finished parsing songs. Adding to queue now.',
        ephemeral: true
      });
      return queue;
    };
    async function youtubeSongsParser(source) {
      let playlist = await ytpl(source); let queue = [], object = {};
      interaction.editReply({
        content: 'YouTube playlist detected! Parsing songs...',
        ephemeral: true
      });
      playlist.items.forEach(video => {
        if (!video.shortURL && !video.url) return logger.debug('Skipped video due to incomplete/malformed response.');
        object = { type: 'youtube', url: video.shortURL || video.url };
        queue.push(object);
      });
      interaction.editReply({
        content: 'Finished parsing songs. Adding to queue now.',
        ephemeral: true
      });
      return queue;
    };
    async function verifySource(input) {
      let song, stream, object, list, response = {
        content: 'Songs added successfully to the queue!',
        embeds: [], components: [],
        ephemeral: true
      };
      if (input.match(/^(http(s)?:\/\/)/)) {
        try {
          input = await longURL(input);
        } catch (err) {
          logger.debug('URL provided may already be the full link.');
          logger.data(`input = ${input}`);
        };
        if (input.match(/soundcloud?(\.com)/)) {
          if (input.match(/(\/sets\/).+/)) {
            list = await soundcloudSongsParser(input);
          } else {
            object = { type: 'soundcloud', url: input };
          };
        } else
          if (input.match(/(youtube\.com|youtu\.be)/)) {
            if (input.match(/\blist=.*$/)) {
              list = await youtubeSongsParser(input);
            } else {
              object = { type: 'youtube', url: input };
            };
          } else {
            response = {
              content: 'That song URL is not supported!',
              embeds: [], components: [],
              ephemeral: true
            };
          };
      } else {
        response = {
          content: 'That song URL is not supported!',
          embeds: [], components: [],
          ephemeral: true
        };
      };
      interaction.editReply(response);
      if (object) voiceData.music.queue.push(object);
      if (list) voiceData.music.queue = voiceData.music.queue.concat(list);
      logger.verbose(`voiceData:${JSON.stringify(voiceData, null, 2)}`);
      await client.data.guild.voice.set(voiceData, guild);
    };
    async function loadSong() {
      if (!voiceData.music.queue[0]) return undefined;
      let { type, url } = voiceData.music.queue[0], stream, title;
      const options = { filter: 'audioonly'/*, dlChunkSize: 0*/ };
      if (type === 'soundcloud') {
        song = await scbi.getSongInfo(url);
        title = song.title.replace(/\'/g, "''");
        stream = await song.downloadProgressive();
      } else
        if (type === 'youtube') {
          song = await ytdl.getBasicInfo(url);
          title = song.videoDetails.title.replace(/\'/g, "''");
          stream = await ytdl(url, options);
        };
      voiceData.music.track = { title, type, };
      await client.data.guild.voice.set(voiceData, guild);
      source = createSource(stream);
      return source;
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
        .setTitle('Music Search Results 🔍')
        .setDescription('Here are some results from your keywords.')
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
          value: (song.title) ? `${song.title.replace("''", "'")}` : 'No song loaded.',
        }
      ];
      return playerEmbed;
    };
    async function searchQuery(query) {
      let results;
      await interaction.editReply({
        content: 'Searching...'
      });
      switch (query.source) {
        case 'youtube':
          results = await ytsa.GetListByKeyword(query.keywords, false, 5);
          break;
        case 'soundcloud':
          results = await scbi.search(query.keywords, "track");
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
          embeds: [dynamicPlayerEmbed(voiceData.music.track)],
          components: [musicPlayerCtrlBtns, musicPlayerExtBtns],
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
        await verifySource(interaction.options.getString('url'));
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
    }; console.log(audioPlayer.listenerCount('stateChange'));
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
              await verifySource(interact.values[0]);
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
                let loadingEmbed = new MessageEmbed(musicBaseEmbed)
                logger.debug(`Fetching queue for ${guild.name} (${guild.id})`);
                loadingEmbed
                  .setTitle(`Queued Songs for ${guild.name}`)
                  .setDescription('Composing song queue, please wait.');
                await interact.editReply(
                  { embeds: [loadingEmbed] }
                );
                loadingEmbed.setDescription('');
                await interact.editReply(
                  { embeds: [await dynamicQueueEmbed(voiceData.music.queue)] }
                );
              } else {
                refreshPlayer(interact);
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