const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Fetches mentioned user\'s avatar and displays in an embed.')
    .addUserOption(option =>
			option
				.setName('target')
				.setDescription('Enter any member mentionable or username.')
				.setRequired(true),
		),
	execute(interaction, client) {
    const member = interaction.options.getMember('target');
    const avatarEmbed = new MessageEmbed()
      .setTitle('Stealing someones identity are we?')
      .setDescription(`Very well.. here is ${member.user.tag}'s current avatar.`)
      .setImage(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter('Bot created and maintained by NovaLynxie.', client.user.displayAvatarURL({ format: 'png' }));
		return interaction.reply(
			{
        embeds: [avatarEmbed],
				ephemeral: true,
			}
		);
	},
};