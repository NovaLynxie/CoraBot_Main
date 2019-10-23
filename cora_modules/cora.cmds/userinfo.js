const Discord = require('discord.js');
module.exports = {
	name: 'userinfo',
	description: 'Get information about a user.',
	aliases: ['whois'],
	execute(message){
		const args = message.content.split(' ');
		console.log(args);
		if (!args[1]) {
			message.channel.send("Missing args! \n```usage: >userinfo <args> [@mention, userID]```")
		} else if (!args[2]){
			let userData = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[1]))
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
		} else if (args[2]==='-legacy'){
			const member = message.mentions.members.first();
			const user = member.user;
			message.channel.send(`Name: ${user.username}, ID: ${user.id}, Username: ${user.lastMessage.member.nickname}`);
		} else {
			return message.channel.send("Unknown User! \n```usage: >userinfo <args> [@mention, userID]```");
		}
	},
};