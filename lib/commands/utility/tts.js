const logger = require('../../utils/winstonLogger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { AudioPlayerStatus } = require('@discordjs/voice');
const { stripIndents } = require('common-tags');
const discordTTS = require('discord-tts');
let audioPlayer, msgCollector, voiceConnection;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tts')
		.setDescription('Text2Speech commands.')
    .addSubcommand(subcommand => 
      subcommand
        .setName('start')
        .setDescription('Starts TTS in text channel and connects to voice chat.')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('Channel to monitor? (optional)')
            .setRequired(false)
        )
    ),
	async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const { guild, member, options } = interaction;
    const channel = options.getChannel('channel') || interaction.channel;
    function generateVoice(text) {
      const stream = discordTTS.getVoiceStream(text);
      const speech = client.voice.player.create(stream, { type: 'opus', volume: 0.5 });
      return speech;
    };
    voiceConnection = client.voice.player.fetch(guild);
    audioPlayer = (voiceConnection) ? voiceConnection._state.subscription ?.player : undefined;
    msgCollector = channel.createMessageCollector({ time: 300000 });
    msgCollector.on('collect',async (msg) => {
      logger.verbose(`[TTS] ${msg.author.tag}:"${msg.content}"`);
      try {
        if (!voiceConnection) {
          voiceConnection = await client.voice.player.join(member.voice.channel);
        };
        voiceConnection.subscribe(audioPlayer);
        await audioPlayer.play(speech);
        await interaction.editReply({ content: 'Speaking now...' });
      } catch (error) {
        logger.debug(error.message); logger.debug(error.stack);
      };
    });
    msgCollector.on('end', res => {
      if (stopped) {
        logger.debug('Message collector timed out, TTS has been stopped.');
      } else {
        logger.debug('Message collector timed out, restarting collector now.');
        msgCollector = channel.createMessageCollector({ time: 300000 });
      };
    });
	},
};