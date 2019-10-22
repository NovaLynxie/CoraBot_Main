module.exports = {
    name: 'stop',
    description: "Stops the song and disconnects the bot.",
    execute(message){
        const serverQueue = message.client.queue.get(message.guild.id);
        if (!message.member.voiceChannel) {
            console.log("Error! UserNotFound_voicechat.channelNoUser")
            return message.channel.send('You have to be in a voice channel to stop the music!')};
        if (!serverQueue) {
            console.log("Error! SkipErr_voicechat.channelQueue.Stop")
            return message.channel.send("Nothing is playing. No songs in queue.");
        }
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
        message.channel.send(":octagonal_sign: Music Stopped!")
    }
};