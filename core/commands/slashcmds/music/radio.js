const logger = require('../../../plugins/winstonlogger');
const { checkVC, joinVC, createSource, newPlayer } = require('../../../handlers/voice/voiceManager');
const { 
  MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu 
} = require('discord.js');
const { AudioPlayerStatus } = require('@discordjs/voice');
const { SlashCommandBuilder } = require('@discordjs/builders');
const wait = require('util').promisify(setTimeout);
const stations = require('../../../assets/json/radioStations.json');
const { ch1, ch2, ch3, ch4, ch5 } = stations;
module.exports = {
  data: new SlashCommandBuilder()
    .setName('radio')
    .setDescription('Starts up the radio!'),
  async execute(interaction, client) {
    // Fetch connection before starting here.
    let connection = checkVC(interaction.guild);
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
                value: ch1.url
              },
              {
                label: ch2.name,
                description: ch2?.desc,
                value: ch2.url
              },
              {
                label: ch3.name,
                description: ch3?.desc,
                value: ch3.url
              },
              {
                label: ch4.name,
                description: ch4?.desc,
                value: ch4.url
              },
              {
                label: ch5.name,
                description: ch5?.desc,
                value: ch5.url
              }
            ]
          )

      )
    // Radio functions which power the button actions and playback.
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
    }
    function radioPlay() {
      player.play(source);
      connection.subscribe(player);
    };
    function radioPause() {

      player.pause();
    };
    function radioStop() {
      player.stop();
    }
    // Create interaction collecter to fetch button interactions.
    const collector = interaction.channel.createMessageComponentCollector({ time: 60000}); 
    // Menu/Button collecter and handler.
    collector.on('collect', async i => {
      await i.deferUpdate();
      await wait(1000);
      switch (i.customId) {
        // button actions - radio menu
        case 'radioIndex': 
          await i.editReply(
            {
              embeds: [radioMenuEmbed],
              components: [radioMenuBtns]
            }
          );
          break;
        case 'closeMenu':
          await i.editReply(
            {
              content: 'Turned off the Radio. Use /radio to turn it back on!',
              embeds: [], components: []
            }
          );
          await wait(5000);
          await i.deleteReply();
          break;
        // button actions - radio player
        case 'radioPlayer':
          radioPlayerEmbed.addFields(
            {
              name: 'Status',
              value: 'Offline'
            },
            {
              name: 'Station',
              value: 'N/A'
            },
            {
              name: 'Now Playing',
              value: `Nothing is playing...`
            }
          )
          await i.editReply(
            {
              embeds: [radioPlayerEmbed], 
              components: [radioPlayerBtns, radioStationsMenu]
            }
          );
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
          //radioPlay(source);
          break;
        case 'pause':
          if (!player) return;
          player.pause();
          break;
        case 'stop':
          if (!player) return;
          player.stop();
          break;
        // fallback action for all radio menus
        default: 
          logger.warn('Invalid button pressed for this menu!');
          logger.verbose('radio.button.default.trigger');
          await i.editReply(
            {
              content: 'That button is invalid or not recognised in this menu!'
            }
          );
      };
    });
    // Log on collector end (temporary)
    collector.on('end', async collected => {
      logger.debug('Collector in help commmand timed out.');
      logger.debug(`Collected ${collected.size} items.`);
    });
    interaction.editReply({
      embeds: [radioMenuEmbed],
      components: [radioMenuBtns],
      ephemeral: false
    });
/*
    //let connection = checkVC(interaction.guild);
    //let streamURL = interaction.options.getString('url');
    if (streamURL) {
      try {
        if (!connection || connection === undefined) {
          logger.debug(`No connections active for ${interaction.guild.name}! Creating one now.`);
          connection = await joinVC(interaction.member.voice.channel);
        } else {
          logger.debug(`Connection active in ${interaction.guild.name}! Using this instead.`);
        };
      } catch (err) {
        logger.error('An error occured while opening a connection!');
        logger.error(err.message); logger.debug(err.stack);
        let errEmbed = new MessageEmbed()
          .setTitle('Error occured!')
          .addFields(
            { name: "Error Data", value: `\`\`\`${err}\`\`\`` }
          );
        return interaction.editReply({
          embeds: [errEmbed]
        })
      }
      let player = newPlayer();
      let source = createSource(streamURL);
      // not yet functional!
      try {
        logger.debug('Starting player now.')
        player.play(source);
        logger.debug('Binding player to connection.')
        connection.subscribe(player);
        logger.debug('Bound connection to Player!');
        player.on('stateChange', (oldState, newState) => {
          logger.debug(`oldState.status => ${oldState?.status}`);        
          logger.debug(`newState.status => ${newState?.status}`);
        });
        player.on(AudioPlayerStatus.Playing, () => {
          logger.debug('Player has started playing!');        
          let radioEmbed = new MessageEmbed()
            .setColor('#5E2071')
            .addFields(
              { name: 'State', value: 'Playing' },
              { name: 'Now Playing', value: streamURL }
            )
          interaction.editReply({ embeds: [radioEmbed] });
        });
        player.on(AudioPlayerStatus.Idle, () => {
          let radioEmbed = new MessageEmbed()
            .setColor('#5E2071')
            .addFields(
              { name: 'State', value: 'Idle/Paused' },
              { name: 'Now Playing', value: streamURL }
            )
          interaction.editReply({ embeds: [radioEmbed] });
          logger.debug('Player currently idle/paused. Awaiting new requests.');
        });
        player.on(AudioPlayerStatus.AutoPaused, () => {
          player.pause();
          let radioEmbed = new MessageEmbed()
            .setColor('#5E2071')
            .addFields(
              { name: 'State', value: 'AutoPaused' },
              { name: 'Now Playing', value: streamURL }
            )
          interaction.editReply({ embeds: [radioEmbed] });
          logger.debug('Player currently autopaused. Awaiting new requests.');
        });
        player.on('error', err => {
          interaction.editReply({ 
            content: 'Error occured during stream playback!',
            embeds: [],
            ephemeral: true
          });
          logger.error('Error occured while playing stream!');
          logger.error(err.message); logger.debug(err.stack);
          player.stop();
        })
      } catch (err) {
        logger.error('There was a problem trying to start the stream!');
        logger.error(err.message); logger.debug(err.stack);
        interaction.editReply({
          content: 'Something went wrong in executing this command!',
          ephemeral: true
        })
      };
    } else {
      //
    };
*/
  }
};