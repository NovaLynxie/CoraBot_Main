module.exports = {
	name: 'purge',
	description: 'Deletes the last messages in all chats.',
	aliases: ['clear','remove'],
	usage: 'purge <int>',
	guildOnly: true,
	async execute(message){
		const args = message.content.split(' ');
		let deleteCount = 0;
		try {
			deleteCount = parseInt(args[1], 10);
		}catch(err) {
			return message.reply('Please provide the number of messages to delete. (max 100)')
		}
        
		if (!deleteCount || deleteCount < 2 || deleteCount > 100)
			return message.reply('Please provide a number between 2 and 100 for the number of messages to delete');

		const fetched = await message.channel.fetchMessages({
			limit: deleteCount,
		});
		console.log("[CoraBot] Purging "+fetched.deleteCount+" messages...")
		message.channel.bulkDelete(fetched)
			.catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
		console.log("[CoraBot] Messages purged successfully!")
	},
};