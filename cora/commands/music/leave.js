const { Command } = require('discord.js-commando');
const logger = require('../../providers/WinstonPlugin');

module.exports = class LeaveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'leave',
      aliases: ['end','dc'],
      group: 'music',
      memberName: 'leave',
      guildOnly: true,
      description: 'Leaves voice channel if in one'
    });
  }

  run(message) {
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('Join a channel and try again');
    if (
      (typeof message.guild.musicData.radioDispatcher == 'undefined' ||
      message.guild.musicData.radioDispatcher == null) &&
      (typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null)
    ) {
      logger.warn('No currently running streams detected, aborting command.');
      return message.reply('There is no song or radio playing right now!');
    }
    if (!message.guild.musicData.queue) {
      logger.warn('Nothing detected in the server queue, aborting command.')
      return message.say('There are no songs in queue')
    };
    if (message.guild.musicData.radioDispatcher) {
      message.guild.musicData.radioDispatcher.end();
      logger.info('Stopping connected radio streams.')
    }
    if (message.guild.musicData.songDispatcher) {
      message.guild.musicData.queue.length = 0;
      message.guild.musicData.songDispatcher.end();
      logger.info('Stopping current music playback.')
    }
    message.say('Finished playing 👋')
    return;
  }
};
