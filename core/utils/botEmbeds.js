const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const baseEmbed = new MessageEmbed().setColor('#75e6c4');
const musicBaseEmbed = new MessageEmbed().setColor('#32527b')
  .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
  .setFooter({ text: 'Powered by DiscordJS Voice (OPUS)' });

function systemEmbed(state, params) {
  const embed = new MessageEmbed(baseEmbed);
  const { response, error } = params;
  let generalDetails = {}, errorDetails = {};
  if (response) {
    generalDetails = {
      name: 'Response Data',
      value: stripIndents`
        \`\`\`${(typeof response === 'object') ? JSON.stringify(response, null, 2) : response}\`\`\``
    };
  };
  if (error) {
    errorDetails = {
      name: 'Error Data',
      value: stripIndents`
        \`\`\`
        ${error.message}
        ${error.stack}
        \`\`\``
    }
  };
  switch (state) {
    case 'success':
      embed
        .setTitle('Success!')
        .setColor('#42f595')
        .addFields(generalDetails);
      break;
    case 'info':
      embed
        .setTitle('Information')
        .setColor('#1bdeb0')
        .addFields(generalDetails);
      break;
    case 'warn':
      embed
        .setTitle('Warning!')
        .setColor('#de7c1b')
        .addFields(generalDetails);
      break;
    case 'error':
      embed
        .setTitle('Error!')
        .setColor('#de481b')
        .addFields(errorDetails);
      break;
    default:
      embed
        .setTitle('Unknown State!')
  };
  return embed;
};

async function dynamicQueueEmbed(queue, index = 1) {
  queuePage = (index <= 1) ? queuePage-- : 1;
  let field = {}, no = 1, info, pos = index * 25 - 24;
  let section = queue.slice(pos - 1, pos + 24); no = pos;
  if (!section.length) {
    logger.verbose('No more songs! Returning to previous page.');
    pos = (index - 1) * 25 - 24; no = pos;
    queue.slice(pos - 1, pos + 24);
  };
  let queueEmbed = new MessageEmbed(musicBaseEmbed);
  queueEmbed
    .setTitle('Music Player Queue 🎼')
    .setDescription(`
        ${guild.name}'s queued songs
        ${(section.length) ? (section.length > 24) ? pos + (section.length - 25) : pos : 0} - ${(section.length < pos + 24) ? pos : pos + 24} of ${queue.length}`);
  logger.verbose(`queue.main.length=${queue.length}`); logger.verbose(`queue.section.length=${section.length}`);
  logger.verbose(`pageNo:${index}; posNo:${pos};`)
  for (const item of section) {
    let { title, duration, type, url } = item;
    try {
      switch (type) {
        case "youtube":
          field = {
            name: `Track #${no}`,
            value: `
                Title: ${title}
                Duration: ${formatDuration(duration)}
                Sourced from YouTube`
          };
          break;
        case "soundcloud":
          field = {
            name: `Track #${no}`,
            value: `
                Title: ${title}
                Duration: ${formatDuration(duration)}
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
  if (song.thumbnail) playerEmbed.setThumbnail(song.thumbnail);
  switch (audioPlayer ?._state.status) {
    case 'idle':
      playerState = 'Idle';
      break;
    case 'buffering':
      playerState = 'Loading...';
      break;
    case 'playing':
      playerState = 'Playing';
      break;
    case 'autopaused':
      playerState = 'Paused (AUTO)';
      break;
    case 'paused':
      playerState = 'Paused';
      break;
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
      value: `${(song) ? `${(song.title) ? `${song.title.replace("''", "'")}` : 'unknown'} (${(song.type) ? song.type : 'unknown'})` : '...'}`,
    },
    {
      name: 'Volume', value: `${Math.floor(voiceData.volume * 100)}%`
    }
  ];
  return playerEmbed;
};

function genericEmbed(params = {}) {
  const {/* add parameters here! */ } = params;
  /* 
   * process parameter data here before passing to switch statement.
   */
  let something = ''; // temporary placeholder;
  switch (something) {
    case 'INSERT_VALUE_HERE':
      break;
    default:
      logger.debug('Unknown Response Type');
  };
  return embed;
};

module.exports = systemEmbed;
module.exports.embeds = {
  generic: genericEmbed,
  music: {},
  system: systemEmbed
};