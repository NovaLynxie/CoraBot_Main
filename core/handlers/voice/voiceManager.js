const logger = require('../../plugins/winstonLogger');
const {
	NoSubscriberBehavior,
	StreamType,
	AudioPlayerStatus,
	VoiceConnectionDisconnectReason,
	VoiceConnectionStatus,
	createAudioPlayer,
	createAudioResource,
	demuxProbe,
	entersState,
	joinVoiceChannel,
	getVoiceConnection,
} = require('@discordjs/voice');

// Audio Player creation.
function newPlayer() {
	const player = createAudioPlayer({
		noSubscriber: NoSubscriberBehavior.Pause,
		maxMissedFrames: Math.round(5000 / 20),
	});
	return player;
}

// Audio Source creation.
function createSource(input) {
	const audioSource = createAudioResource(input);
	return audioSource;
}

// Voice Connection functions.
function checkVC(guild) {
	const voiceConnection = getVoiceConnection(guild.id);
	return voiceConnection;
}
async function joinVC(channel) {
	if (!channel) throw new Error('Missing channel data! Got null or undefined! Expected a channel object!');
	logger.data(JSON.stringify(channel, null, 2));
	const voiceConnection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});
	// return voiceConnection;
	try {
		await entersState(voiceConnection, VoiceConnectionStatus.Ready, 30_000);
		logger.debug('Connection successful! Ready to play audio.');
		return voiceConnection;
	}
	catch (error) {
		logger.error('Connection error! Clearing connection!'); voiceConnection.destroy();
		logger.error(error.message); logger.debug(error.stack);
		logger.warn('Forced closed connection to save resources.');
		throw new Error(error); // abort if connection errored out.
	}
}

module.exports = { checkVC, joinVC, createSource, newPlayer };