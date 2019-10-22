module.exports = {
	name: 'nowplaying',
	description: 'Gets the song that is currently playing.',
	execute(message, bot, token){
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!serverQueue) return message.channel.send('There is nothing playing.');
		return message.channel.send(`Now playing: ${serverQueue.songs[0].title}`);
	},
};