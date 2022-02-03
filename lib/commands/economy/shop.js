const logger = require('../../utils/winstonLogger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const econCore = require('../../plugins/economyCore');

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
        .addStringOption(option =>
          option
            .setName('itemid')
            .setDescription("Item's ID")
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('amount')
            .setDescription('Amount')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('sell')
        .setDescription('Sell item to guild shop.')
        .addStringOption(option =>
          option
            .setName('itemid')
            .setDescription("Item's ID")
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('amount')
            .setDescription('Amount')
            .setRequired(true)
        )
    ),
  async execute(interaction, client) {
    await interaction.deferReply();
    const { options } = interaction;
    const subcmd = options.getSubcommand();
    const itemId = options.getString('itemid');
    const amount = options.getInteger('amount');
    const member = interaction.member;
    const econShop = await client.data.economy.get(guild, 'shop');
    let mode, economyEmbed = new MessageEmbed().setColor('#e36a5f');
    // TODO - Start implementing shop command!
  }
};