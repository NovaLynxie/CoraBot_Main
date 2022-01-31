const logger = require('../../utils/winstonLogger');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Economy Shop Commands!')
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription("Fetch available guild shop items.")
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('buy')
        .setDescription('Buy an item from guild shop.')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('sell')
        .setDescription('Sell item to guild shop.')
        .addStringOption(option =>
          option
            .setName('itemId')
            .setDescription('Item ID to buy')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('amount')
            .setDescription('Quantity')
            .setRequired(true)
        )
    ),
  async execute(interaction, client) {
    //
  }
};