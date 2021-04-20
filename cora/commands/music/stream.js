const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const logger =  require('../../providers/WinstonPlugin');

module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'stream',
      aliases: ['play-stream'],
      memberName: 'stream',
      group: 'music',
      description: 'Plays any valid stream urls.',
      details: `Plays any valid stream urls via the bot in a voice channel.`,
      guildOnly: true,
      clientPermissions: ['SPEAK', 'CONNECT'],
      throttling: {
        usages: 2,
        duration: 5
      },
      args: [
        {
          key: 'query',
          prompt: 'Which stream would you like to listen to?',
          type: 'string',
          //validate: query => query.length > 0 && query.length < 200
        }
      ]
    });
  }

  async run(message, { query }) {
    if (query.length === 0) {
      logger.warn("No url was provided on request! Alerting user and aborting command.")
      return message.reply("you haven't provided a stream URL for me to play!")
    }
    const streamURL = query
    var voiceChannel = message.member.voice.channel
    if (voiceChannel) {
        voiceChannel.join()
            .then(connection => {
              message.say('📻 Tuning into stream, please wait.')
              const dispatcher = connection.play(`${streamURL}`)
                    .on('start', () => {
                        logger.info(`Loading stream, please wait.`)
                        message.guild.musicData.radioDispatcher = dispatcher;
                        dispatcher.setVolume(message.guild.musicData.volume);
                        message.guild.musicData.isPlaying = false;
                        const radioEmbed = new MessageEmbed()
                            .setColor('#5E2071')
                            .addField('Now Playing:', streamURL)
                        message.say(radioEmbed);
                        return
                    })
                    .on('finish', () => {
                      logger.info('Stream stopped, leaving voice channel.');
                      message.guild.musicData.isPlaying = false;
                      return message.guild.me.voice.channel.leave();
                    })
                    .on('error', e => {
                        message.say('Unable to play stream');
                        console.error(e);
                        message.guild.musicData.isPlaying = false;
                        message.guild.musicData.nowPlaying = null;
                        return message.guild.me.voice.channel.leave();
                    })

            })
            .catch(err => {
                console.log('[Error] Failed to play stream! Unrecognised URL or invalid input!')
                console.log(err)
            })
    } else {
        message.reply(stripIndents`
        you are not in a voice channel!
        Please join one and try again.`)
    }
  }
};
