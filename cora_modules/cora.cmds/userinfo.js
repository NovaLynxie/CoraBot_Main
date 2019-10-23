const {
	Discord
} = require('discord.js');
module.exports = {
	name: 'userinfo',
	description: 'Get information about a user.',
	aliases: ['whois'],
	execute(message){
		const args = message.content.split(' ');
		if (!args.length) {
			return message.channel.send("Unknown User! \n```usage: >userinfo <args> [@mention, userID]```");
		}
		let userData = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]))
		//console.log(userData) //debug code line to dump info to console
		var embed = new Discord.RichEmbed()
			.setDescription("__**Member Information**__")
			.setColor(0x15f153)
			.setThumbnail(userData.user.avatarURL)
			.addField("Username", `${userData.user.username}#${userData.user.discriminator}`)
			.addField("User ID", userData.id)
			.addField("Online Status", `${userData.presence.status}`)
			.addField("Created at", userData.user.createdAt)
			.addField("Joined at", userData.joinedAt)
		message.channel.send(embed)
	},
};