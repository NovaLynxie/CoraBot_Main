const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions, MessageEmbed } = require('discord.js');
const { FLAGS } = Permissions;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Generates a new invite'),
	execute(interaction, client) {
    const inviteLink = client.generateInvite({
      permissions: [
        // ..
      ],
      scopes: ['application.commands']
    });
    if (!inviteLink) return;
    const inviteEmbed = new MessageEmbed()
      .setTitle('Application Invitation System')      
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setDescription(`Invite generated! Click [here](${inviteLink}) to begin connecting the bot to your server.`)
      .setFooter('Bot created and maintained by NovaLynxie.', client.user.displayAvatarURL({ format: 'png' }));
		return interaction.reply(
			{
        embeds: [inviteEmbed],
				ephemeral: true,
			}
		);
	},
};