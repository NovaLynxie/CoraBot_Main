const {
    Util
} = require('discord.js')
const ytdl = require('ytdl-core')
// to be written using existing 'play' command with modifications
module.exports = {
    name: 'play',
    description: "Plays a song in member's voice channel!",
    async execute(message, bot){
        const args = message.content.split(' ');
        const queue = message.client.queue;
        const serverQueue = queue.get(message.guild.id);

        const voiceChannel = message.member.voiceChannel;
        if (!voiceChannel) {
          console.log("Error! TargetChannel_voicechat.channelNotSpecified")
          return message.channel.send('I need a voicechannel to play music!');} 
        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
          console.log("Error! InsufficientPerms_voicechat.channelPermsErr")
          return message.channel.send("Insufficient permissions for users channel! Check bot and channel's permissions!");
        }
      
        const songInfo = await YTDL.getInfo(args[1]);
        const song = {
          title: songInfo.title,
          url: songInfo.video_url,
        };
      
        if (!serverQueue) {
          const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true,
          };
          queue.set(message.guild.id, queueContruct);
          queueContruct.songs.push(song);
          try {
            var connection = await voiceChannel.join();
            queueContruct.connection = connection;
            play(message.guild, queueContruct.songs[0]);
          } catch (err) {
            console.log(err);
            queue.delete(message.guild.id);
            return message.channel.send(err);
          }
        } else {
          serverQueue.songs.push(song);
          //console.log(serverQueue.songs);
          return message.channel.send(`${song.title} has been added to the queue!`);
        }
    },

    play(guild, song) {
        const serverQueue = queue.get(guild.id);

        if (!song) {
            serverQueue.voiceChannel.leave();
            queue.delete(guild.id);
            return;
        }

        const dispatcher = serverQueue.connection.playStream(YTDL(song.url))
            .on('end', () => {
                console.log('Bot.MusicEnd'); //Debug to check when song ends.
                serverQueue.songs.shift();
                play(guild, serverQueue.songs[0]);
            })
            .on('error', error => {
                console.error(error);
            });
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    }
};