const logger = require('../../utils/winstonLogger');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bank')
    .setDescription('Economy Bank Commands!')
    .addSubcommand(subcommand =>
      subcommand
        .setName('view')
        .setDescription("View account balance.")
        .addUserOption(option =>
          option
            .setName('target')
            .setDescription('User mentionable, ID or username')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('transfer')
        .setDescription('Transfer amount to another user.')
        .addIntegerOption(option =>
          option
            .setName('amount')
            .setDescription('Funds to transfer')
            .setRequired(true)
        )
        .addUserOption(option =>
          option
            .setName('target')
            .setDescription('User mentionable, ID or username')
            .setRequired(true)
        )
    ),
  async execute(interaction, client) {
    //
  }
};