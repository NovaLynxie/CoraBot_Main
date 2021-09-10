const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('../../../plugins/winstonLogger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans mentioned user with optional reason.')
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
  execute(interaction, client) {
    const user = interaction.options.getUser('target');
    const staff = interaction.user;
    if (staff.roles.cache.some(role => staffRoles.indexOf(role.id))) {
	    // ...
    } else {
      interaction.reply({
        content: 'You do not have permission to ban this member!',
        ephemeral: true
      })
    };
  }
};