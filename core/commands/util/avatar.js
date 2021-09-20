const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Replies with \'Pong\' and response time.')
    .addMemberOption(option =>
			option
				.setName('target')
				.setDescription('Enter any member mentionable or username.')
				.setRequired(false),
		),
	async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const member = interaction.options.getMember('target');
    const avatarEmbed = new MessageEmbed()
      .setTitle('Stealing someones identity are we?')
      .setDescription(`Very well.. here is ${member.user.tag}'s current avatar.`)
      .setImage(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter('Bot created and maintained by NovaLynxie.', client.user.displayAvatarURL({ format: 'png' }));
		await interaction.reply(
			{				
        embeds: [avatarEmbed],
				ephemeral: true,
			}
		);
	},
};