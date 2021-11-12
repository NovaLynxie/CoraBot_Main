const logger = require('../utils/winstonLogger');
const {
	NoSubscriberBehavior, VoiceConnectionStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel, getVoiceConnection,
} = require('@discordjs/voice');

function newAudioPlayer() {
	let audioPlayer = createAudioPlayer({
		noSubscriber: NoSubscriberBehavior.Pause,
		maxMissedFrames: Math.round(5000 / 20),
	});
  return audioPlayer;
};

function createSource(input) {
	const audioSource = createAudioResource(input);
	return audioSource;
};

function checkVC(guild) {
	const voiceConnection = getVoiceConnection(guild.id);
	return voiceConnection;
};

async function joinVC(channel) {
	if (!channel) return logger.error('Missing channel data! Got null or undefined! Expected a channel object!');
	logger.data(JSON.stringify(channel, null, 2));
	const voiceConnection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});
	try {
		await entersState(voiceConnection, VoiceConnectionStatus.Ready, 30_000);
		logger.debug('Connection successful! Ready to play audio.');
		return voiceConnection;
	}	catch (error) {
		logger.error('Connection error! Clearing connection!'); voiceConnection.destroy();
		logger.error(error.message); logger.debug(error.stack);
		logger.warn('Forced closed connection to save resources.');
		throw new Error(error);
	};
};

module.exports = { checkVC, createSource, joinVC, newAudioPlayer };