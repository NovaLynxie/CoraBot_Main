const logger = require('../../plugins/winstonlogger');
const {
	NoSubscriberBehavior,
	StreamType,
	createAudioPlayer,
	createAudioResource,
	entersState,
	AudioPlayerStatus,
	VoiceConnectionStatus,
	joinVoiceChannel,
} = require('@discordjs/voice');

const player = createAudioPlayer({
	behaviors: {
		noSubscriber: NoSubscriberBehavior.Play,
		maxMissedFrames: Math.round(5000 / 20),
	},
});

let connection;
function joinVC(channel) {
  logger.data(JSON.stringify(channel,null,2));
  connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });
};

player.on('stateChange', (oldState, newState) => {
	if (oldState.status === AudioPlayerStatus.Idle && newState.status === AudioPlayerStatus.Playing) {
		logger.debug('Playing audio output on audio player');
	} else if (newState.status === AudioPlayerStatus.Idle) {
		logger.debug('Playback has stopped. Attempting to restart.');
		//attachRecorder();
	}
});

module.exports = { joinVC };