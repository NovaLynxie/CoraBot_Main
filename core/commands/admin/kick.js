const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../../../plugins/winstonLogger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks mentioned user with optional reason.')
    .addUserOption(option => 
      option
        .setName('target')
        .setDescription('Select a user')
        .setRequired(true)
    )
    .addStringOption(option => 
      option
        .setName('reason')
        .setDescription('Reason for ban?')
        .setRequired(false)
    ),
  async execute(interaction, client) {
    // processing information so call this to extend the timeout.
		await interaction.deferReply({ ephemeral: true });
    const member = interaction.options.getUser('target');
    const user = interaction.user; const guild = interaction.guild;
    const settings = await client.settings.guild.get(guild); const { staff } = settings;
    if (staff.roles.cache.some(role => staffRoles.indexOf(role.id))) {
	    // ...
    } else {
      interaction.reply({
        content: 'You do not have permission to kick this member!',
        ephemeral: true
      })
    };
  }
};