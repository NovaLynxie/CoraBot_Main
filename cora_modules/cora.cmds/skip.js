module.exports = {
    name: 'skip',
    description: "Skips the song playing in the channel.",
    execute(message, bot){
        if (!message.member.voiceChannel) {
            console.log("Error! UserNotFound_voicechat.channelNoUser") 
            return message.channel.send('You have to be in a voice channel to skip the music!')
          }
          if (!serverQueue) {
            console.log("Error! SkipErr_voicechat.channelSongSkip")
          return message.channel.send('There is no song that I could skip!');
          }
          serverQueue.connection.dispatcher.end();
    }
};