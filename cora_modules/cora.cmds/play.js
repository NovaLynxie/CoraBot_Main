const {
	Util
} = require('discord.js');
const ytdl = require('ytdl-core');

module.exports = {
	name: 'play',
	description: 'Play a song in your channel!',
	aliases: ['sing'],
	async execute(message) {
    const args = message.content.split(' ');
		const queue = message.client.queue;
		const serverQueue = message.client.queue.get(message.guild.id);

		const voiceChannel = message.member.voiceChannel;
		if (!voiceChannel) {
			console.log("Error! TargetChannel_voicechat.channelNotSpecified")
			return message.channel.send('I need a voicechannel to play music!');} 
		  const permissions = voiceChannel.permissionsFor(message.client.user);
		  if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
			console.log("Error! InsufficientPerms_voicechat.channelPermsErr")
			return message.channel.send("Insufficient permissions for users channel! Check bot and channel's permissions!");
		  }

		const songInfo = await ytdl.getInfo(args[1]);
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
				this.play(message, queueContruct.songs[0]);
			} catch (err) {
				console.log(err);
				queue.delete(message.guild.id);
				return message.channel.send(err);
			}
		} else {
			serverQueue.songs.push(song);
			return message.channel.send(`${song.title} has been added to the queue!`);
		}
	},

	play(message, song) {
		const queue = message.client.queue;
		const guild = message.guild;
		const serverQueue = queue.get(message.guild.id);
	
		if (!song) {
			serverQueue.voiceChannel.leave();
			queue.delete(guild.id);
			return;
		}
	
		const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
			.on('end', () => {
        console.log('Music ended!');
				serverQueue.songs.shift();
				this.play(message, serverQueue.songs[0]);
			})
			.on('error', error => {
				console.error(error);
			});
		dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
	}
};