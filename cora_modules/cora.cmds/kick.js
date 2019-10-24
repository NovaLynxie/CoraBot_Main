module.exports = {
	name: 'kick',
	aliases: ['boot'],
	description: 'Kicks the specified guild member',
	usage: 'kick <@user>',
	//examples: ['kick @<member>', 'boot @<member>'],
	guildOnly: true,
	execute(message){
		const member = message.mentions.members.first();

		if (!member) {
			return message.reply('You need to mention the member you want to kick');
		}

		if (!member.kickable) {
			return message.reply('I can\'t kick this user.');
		}

		return member
			.kick()
			.then(() => message.reply(`${member.user.tag} was kicked.`))
			.catch(error => message.reply('Sorry, an error occured.'));
	},
};