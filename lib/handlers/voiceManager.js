const logger = require('../utils/winstonLogger');
const {
  NoSubscriberBehavior, VoiceConnectionStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel, getVoiceConnection,
} = require('@discordjs/voice');
function newAudioPlayer() {
  let audioPlayer = createAudioPlayer({
    debug: false,
    behaviours: { 
      noSubscriber: NoSubscriberBehavior.Pause,
      maxMissedFrames: Math.round(5000 / 20)
    }
  });
  return audioPlayer;
};
function newAudioSource(input, { metadata = {}, type, volume }) {
  const audioSource = createAudioResource(input, {
    metadata: (metadata) ? metadata : undefined,
    inlineVolume: true, inputType: (type) ? type : undefined
  });
  if (audioSource.volume) {
    audioSource.volume.setVolume(volume || 0.2);
  };  
  return audioSource;
};
function checkVC(guild) {
  const voiceConnection = getVoiceConnection(guild.id);
  return voiceConnection;
};
async function joinVC(channel) {
  if (!channel) return logger.error('Missing channel data! Got null or undefined! Expected Channel object!');
  if (!channel.isVoice() || channel.type !== 'GUILD_VOICE') return logger.error('Not a voice channel! Expected GUILD_VOICE channel!')
  logger.verbose(`voiceChannel:${JSON.stringify(channel, null, 2)}`);
  const voiceConnection = joinVoiceChannel({
    channelId: channel.id, guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });
  try {
    await entersState(voiceConnection, VoiceConnectionStatus.Ready, 30_000);
    logger.debug('Connection successful! Ready to play audio.');
    return voiceConnection;
  } catch (error) {
    logger.error('Connection error! Aborting voicechannel connection!');
    voiceConnection.destroy();
    logger.error(error.message); logger.debug(error.stack);
    logger.warn('Forced closed connection to save resources.');
    throw new Error(error);
  };
};
module.exports.voice = {
  init: newAudioPlayer, create: newAudioSource, fetch: checkVC, join: joinVC
};