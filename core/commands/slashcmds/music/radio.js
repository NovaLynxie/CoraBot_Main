const logger = require('../../../plugins/winstonlogger');
const { 
  MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu 
} = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);
// require bot voice handlers.
const { checkVC, joinVC, createSource, newPlayer } = require('../../../handlers/voice/voiceManager');
// fetch available stations.
const stations = require('../../../assets/json/radioStations.json');
const { ch1, ch2, ch3, ch4, ch5 } = stations;
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

    // Radio Menu Embed
    let radioMenuEmbed = new MessageEmbed()
      .setTitle('Radio Menu')
      .setDescription('Personal Radio Service')      
      .setFooter('Powered by DiscordJS Voice (OPUS)')
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }));
    // Radio Player Embed
    let radioPlayerEmbed = new MessageEmbed()
      .setTitle('Radio Player v1.0')
      .setFooter('Powered by DiscordJS Voice (OPUS)')
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }));
    
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
        new MessageButton()
          .setCustomId('pause')
          .setLabel('Pause')
          .setStyle('SECONDARY'),
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
                description: ch1?.desc,
                value: ch1.name
              },
              {
                label: ch2.name,
                description: ch2?.desc,
                value: ch2.name
              },
              {
                label: ch3.name,
                description: ch3?.desc,
                value: ch3.name
              },
              {
                label: ch4.name,
                description: ch4?.desc,
                value: ch4.name
              },
              {
                label: ch5.name,
                description: ch5?.desc,
                value: ch5.name
              }
            ]
          )

      )
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
      radioPlayerEmbed.addFields(
        {
          name: 'Status',
          value: playerState
        },
        {
          name: 'Station',
          value: (station) ? `${station?.name} - ${station?.desc}` : 'No station loaded.'
        },
        {
          name: 'Now Playing',
          value: `Nothing is playing...`
        }
      )
      return radioPlayerEmbed;
    };
    // Update player interface from dynamic embed.
    async function refreshPlayer(interact) {
      await interact.editReply(
        {
          embeds: [dynamicPlayerEmbed(station)], 
          components: [radioPlayerBtns, radioStationsMenu]
        }
      );
    }
    // Create interaction collecter to fetch button interactions.
    const collector = interaction.channel.createMessageComponentCollector({ time: 180_000}); 
    // Check if player is defined. If undefined or null, create one.
    player = (!player) ? newPlayer() : player;
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
          await interact.editReply(
            {
              embeds: [radioMenuEmbed],
              components: [radioMenuBtns]
            }
          );
          break;
        case 'closeMenu':
          await interact.editReply(
            {
              content: 'Turned off the Radio. Use /radio to turn it back on!',
              embeds: [], components: []
            }
          );
          await wait(5000);
          await interact.deleteReply();
          break;
        // button actions - radio player
        case 'radioPlayer':
          refreshPlayer(interact);
          break;
        // Join/Leave Voice Actions
        case 'joinVC':
          if (!interaction.member.voice.channel) return;
          connection = await joinVC(interaction.member.voice.channel);
          break;
        case 'leaveVC':
          connection.destroy();
          break;
        // Radio Player Actions
        case 'play':
          if (!player) return;
          player.play(source);
          connection.subscribe(player);
          refreshPlayer(interact);
          break;
        case 'pause':
          if (!player) return;
          player.pause();
          refreshPlayer(interact);
          break;
        case 'stop':
          if (!player) return;
          player.stop();
          refreshPlayer(interact);
          break;
        // Radio Selection Actions
        case 'radioStations':
          selectMenu(); refreshPlayer(interact);
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
      logger.debug('Collector in radio commmand timed out.');
      logger.debug(`Collected ${collected.size} items.`);
      await interaction.editReply(
        {
          content: 'Radio Menu timed out. To continue using the menu, run /radio again.',
          embeds: [], components: []
        }
      );
      await wait(5000);
      await interaction.deleteReply();
    });
    interaction.editReply({
      embeds: [radioMenuEmbed],
      components: [radioMenuBtns],
      ephemeral: false
    });
  }
};