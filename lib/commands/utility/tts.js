const { SlashCommandBuilder } = require('@discordjs/builders');
const { stripIndents } = require('common-tags');
const discordTTS = require('discord-tts');
let audioPlayer, voiceConnection;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('tts')
		.setDescription('Says typed phrase in your voice channel!')
    .addStringOption(option =>
      option
        .setName('input').setDescription('What should I say?')
        .setRequired(true)
    ),
	async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const { guild, member, options } = interaction;
    const input = options.getString('input');
    const stream = discordTTS.getVoiceStream(input);
    const speech = client.voice.player.create(stream. { type: 'arbitrary', volume: 0.5 });
    voiceConnection = client.voice.player.fetch(guild);
    audioPlayer = (voiceConnection) ? voiceConnection._state.subscription ?.player : undefined;
    voiceConnection.subscribe(audioPlayer);
    await audioPlayer.play(speech);
    await interaction.editReply({ content: 'Speaking now...' });
	},
};