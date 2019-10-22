module.exports = {
    name: 'stop',
    description: "Stops the song and disconnects the bot.",
    execute(message, bot){
        const queue = message.client.queue;
        const serverQueue = queue.get(message.guild.id);
        if (!message.member.voiceChannel) {
            console.log("Error! UserNotFound_voicechat.channelNoUser")
            return message.channel.send('You have to be in a voice channel to stop the music!');}
        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
    }
};