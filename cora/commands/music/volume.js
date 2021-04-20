const { Command } = require('discord.js-commando');
const logger = require('../../providers/WinstonPlugin');

module.exports = class VolumeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'volume',
      aliases: ['change-volume','vol'],
      group: 'music',
      memberName: 'volume',
      guildOnly: true,
      description: 'Adjust song volume',
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [
        {
          key: 'wantedVolume',
          prompt: 'What volume would you like to set? from 1 to 200',
          type: 'integer',
          validate: wantedVolume => wantedVolume >= 1 && wantedVolume <= 200 || undefined
        }
      ]
    });
  }

  run(message, { wantedVolume }) {
    const voiceChannel = message.member.voice.channel;
    const songDispatcher = message.guild.musicData.songDispatcher;
    const radioDispatcher = message.guild.musicData.radioDispatcher;
    if (!voiceChannel) return message.reply('Join a channel and try again');

    if (typeof songDispatcher === "undefined" || typeof radioDispatcher === "undefined") {
      return message.reply('there is no song playing right now')
    }
    const volume = wantedVolume / 100;
    if (songDispatcher) {
      songDispatcher.setVolume(volume);
    }
    if (radioDispatcher) {
      radioDispatcher.setVolume(volume);
    }
    message.say(`Current volume is: ${wantedVolume}%`);
  }
};
