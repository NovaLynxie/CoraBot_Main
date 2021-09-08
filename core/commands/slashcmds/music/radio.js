const logger = require('../../../plugins/winstonLogger');
const { 
  MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu 
} = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);
// require bot voice handlers.
const { checkVC, joinVC, createSource, newPlayer } = require('../../../handlers/voice/voiceManager');
// fetch available stations.
const radioData = require('../../../assets/resources/radioStations.json');
const { ch1, ch2, ch3, ch4, ch5 } = radioData;
const { rock, pop, country, pony } = radioData;
module.exports = {
  data: new SlashCommandBuilder()
    .setName('radio')
    .setDescription('Starts up the radio!'),
  async execute(interaction, client) {
    // Fetch connection before starting here.
    let connection = checkVC(interaction.guild);
    // Define 'default' variables here.
    let player, source, station;
    // Processing information so call this to extend the timeout.
    await interaction.deferReply({ ephemeral: false });

    let radioEmbedThumb = client.user.displayAvatarURL({ dynamic: true });
    let radioEmbedFooter = 'Powered by DiscordJS Voice (OPUS)';
    // Radio Menu Embed
    let radioMenuEmbed = new MessageEmbed()
      .setTitle('Radio Main Menu')
      .setDescription('Personal Radio Service')      
      .setFooter(radioEmbedFooter)
      .setThumbnail(radioEmbedThumb);
    // Radio Player Embed
    let radioPlayerEmbed = new MessageEmbed()
      .setTitle('Radio Player v1.0')
      .setFooter(radioEmbedFooter)
      .setThumbnail(radioEmbedThumb);
    // Radio Selecton Embed
    let radioSelectorEmbed = new MessageEmbed()
      .setTitle('Radio Selection Menu')
      .setFooter(radioEmbedFooter)
      .setThumbnail(radioEmbedThumb);

    // Radio Buttons to control the playback.
    let radioMenuBtns = new MessageActionRow()
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
    let radioPlayerBtns = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('play')
          .setLabel('Play')
          .setStyle('SECONDARY'),
        /* (Not really useful?)
        new MessageButton()
          .setCustomId('pause')
          .setLabel('Pause')
          .setStyle('SECONDARY'),
        */
        new MessageButton()
          .setCustomId('stop')
          .setLabel('Stop')
          .setStyle('DANGER'),
        new MessageButton()
          .setCustomId('radioIndex')
          .setLabel('Radio Menu')
          .setStyle('PRIMARY')
      )
    // Radio Selection for choosing the station to play back.
    let radioStationsMenu = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('radioStations')
          .setPlaceholder('Select a station.')
          .addOptions(
            [
              {
                label: ch1.name,
                description: ch1?.site,
                value: ch1.name
              },
              {
                label: ch2.name,
                description: ch2?.site,
                value: ch2.name
              },
              {
                label: ch3.name,
                description: ch3?.site,
                value: ch3.name
              },
              {
                label: ch4.name,
                description: ch4?.site,
                value: ch4.name
              }
              /*
              {
                label: chX.name,
                description: chX?.site,
                value: chX.name
              }
              */
            ]
          )

      )

    let radioStationsCategories = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('selectCategory')
          .setPlaceholder('Select a station.')
          .addOptions(
            [
              {
                label: 'Rock',
                description: ch1?.site,
                value: 'rock'
              },
              {
                label: 'Pop',
                description: ch2?.site,
                value: ch2.name
              },
              {
                label: 'Country',
                description: ch3?.site,
                value: 'country'
              },
              {
                label: 'Pony',
                description: ch4?.site,
                value: 'pony'
              }
            ]
          )
      )
    function dynamicStationSelector (category) {
      let options = [];
      category.forEach(item => {
        let object = {
          label: item.name,
          description: item?.site,
          value: item.name
        };
        options.push(object);
      });
      let radioStationsSelector = new MessageActionRow()
        .addComponents(
          new MessageSelectMenu()
            .setCustomId('selectStation')
            .setPlaceholder('Select a station.')
            .addOptions(options)
        );
      return radioStationsSelector;
    };
    // Radio functions which control all of the radio functionality.
    async function joinChannel (channel) {
      connection = checkVC(interaction.guild);
      try {
        if (!connection) {
          logger.debug(`No connections found in ${interaction.guild.name}, creating one.`);
          connection = await joinVC(interaction.member.voice.channel);
        } else {
          logger.debug(`Connection already active in ${interaction.guild.name}.`);
        }
      } catch (err) {
        logger.error('An error occured while opening a connection!');
        logger.error(err.message); logger.debug(err.stack);
        let errEmbed = new MessageEmbed()
          .setTitle('Radio has stopped working!')
          .setDescription('Failed to open a connection, stopped radio interaction. Please run /radio again.')
          .addFields(
            { name: "Error Data", value: `\`\`\`${err}\`\`\`` }
          );
        return interaction.editReply({
          embeds: [errEmbed]
        })
      }
    };
    // Dynamic Radio Player Embed
    function dynamicPlayerEmbed (station) {
      let playerState;
      switch (player?._state.status) {
        case 'idle':
          playerState = 'Idle'
          break;
        case 'buffering':
          playerState = 'Buffering'
          break;
        case 'playing':
          playerState = 'Playing'
          break;
        case 'autopaused':
          playerState = 'AutoPaused'
          break;
        case 'pause':
          playerState = 'Paused'
          break;
        default: 
          playerState = 'Stopped'
      }
      radioPlayerEmbed.fields = [
        {
          name: 'Player Status',
          value: playerState
        },
        {
          name: 'Station Information',
          value: (station) ? `Name: ${station?.name}
          Desc:  ${station?.desc}` : 'No station loaded.'
        },
        {
          name: 'Now Playing (WIP)',
          value: `Nothing is playing...`
        }
      ]
      return radioPlayerEmbed;
    };
    // Update player interface from dynamic embed.
    async function refreshPlayer(interact) {
      try {
        await interact.editReply(
          {
            embeds: [dynamicPlayerEmbed(station)], 
            components: [radioPlayerBtns, radioStationsMenu]
          }
        );
      } catch (err) {
        logger.debug('Error updating player interface!');
        logger.debug(err.stack);
      };    
    };
    // Create interaction collecter to fetch button interactions.
    const collector = interaction.channel.createMessageComponentCollector({ time: 300000 });
    var menuOpen, playerOpen;
    // Check if player is defined. If undefined or null, create one.
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
      function selectMenu() {
        // Select Menu Switch/Case Handler
        switch (interact.values[0]) {
          case ch1.name:
            station = ch1; source = createSource(ch1.url);
            break;
          case ch2.name:
            station = ch2; source = createSource(ch2.url);
            break;
          case ch3.name:
            station = ch3; source = createSource(ch3.url);
            break;
          case ch4.name:
            station = ch4; source = createSource(ch4.url);
            break;
          case ch5.name:
            station = ch5; source = createSource(ch5.url);
            break;
          default:
            logger.debug('Select Menu option Invalid/Unknown!');
        }
      };
      // Button Switch/Case Handler
      switch (interact.customId) {
        // button actions - radio menu
        case 'radioIndex': 
          playerOpen = false;
          menuOpen = true;
          await interact.editReply(
            {
              embeds: [radioMenuEmbed],
              components: [radioMenuBtns]
            }
          );
          break;
        case 'closeMenu':
          menuOpen = false;
          await interact.editReply(
            {
              content: 'Radio menu closed.',
              embeds: [], components: []
            }
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
              content: "You are not in a voice channel! Please join one first!",
              ephemeral: true
            })
          }
          connection = await joinVC(interaction.member.voice.channel);
          break;
        case 'leaveVC':
          if (!interaction.member.voice.channel) {
            interact.followUp({
              content: "You are not in a voice channel! Join the bot's voice channel first.",
              ephemeral: true
            })
          } else 
          if (!connection) {
            interact.followUp({
              content: "The bot",
              ephemeral: true
            })
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
        case 'radioStations':
          selectMenu(); 
          player.play(source);
          refreshPlayer(interact);
          break;
        case 'radioSelectSubmenu': 
          
          break;
        // fallback action for all radio menus
        default: 
          logger.warn('Invalid or unknown action called!');
          logger.verbose('radio.button.default.trigger');
          await interact.editReply(
            {
              content: 'That action is invalid or not available!'
            }
          );
      };
    });
    // Log on collector end (temporary)
    collector.on('end', async collected => {
      logger.debug('Collector in radio commmand timed out or was stopped.');
      logger.debug(`Collected ${collected.size} items.`);
      if (!menuOpen) return; // don't edit replies after this is called!
      await interaction.editReply(
        {
          content: 'Radio Menu timed out. To continue using the menu, run /radio again.',
          embeds: [], components: []
        }
      );
      await wait(5000);
      await interaction.deleteReply();
    });
    menuOpen = true;
    interaction.editReply({
      embeds: [radioMenuEmbed],
      components: [radioMenuBtns],
      ephemeral: false
    });
  }
};