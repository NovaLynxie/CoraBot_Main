const logger = require('../../utils/winstonLogger');
const { SlashCommandBuilder, time } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const econCore = require('../../plugins/economyCore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Economy Shop Commands!')
    .addSubcommand(subcommand =>
      subcommand
        .setName('listings')
        .setDescription("Fetch available guild shop items.")
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('inventory')
        .setDescription("View user's or your inventory.")
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
    const { guild, member, options } = interaction;
    const subcmd = options.getSubcommand();
    const itemId = options.getString('itemid');
    const amount = options.getInteger('amount');
    const econShop = await client.data.economy.get(guild, 'shop');
    const econUser = await client.data.economy.get(member, 'users');
    let mode, economyEmbed = new MessageEmbed().setColor('#e36a5f');
    // TODO - Start implementing shop command!
    function itemLister(items) {
      let itemList = [], index = 0;
      for (const item of items) {
        itemList.push({
          name: `${item.id} - Item #${index + 1}`,
          value: `
          **Name:** ${item.name}
          **Cost:** ${item.cost}
          __**Description**__
          ${item.desc || 'No description'}.`
        }); index++;
      };
      return (itemList.length >= 1) ? itemList : [];
    };
    switch (subcmd) {
      case 'buy':
        break;
      case 'sell':
        break;
      case 'listings':
        economyEmbed
          .setTitle('Economy - Guild Listings')
          .setDescription(`Available item listing as of ${time(new Date)}`)
          .addFields((econShop.items.length) ? itemLister(econShop.items) : {
            name: 'Nothing currently listed!',
            value: 'Ask your server admins to add new shop listings.'
          });
        break;
      case 'inventory':
        economyEmbed
          .setTitle('Economy - User Inventory')
          .setDescription(`${member}'s inventory as of ${time(new Date)}`)
          .addFields((econUser.items.length) ? itemLister(econUser.items) : {
            name: 'You have no items!',
            value: `
            Try checking the shop for new item listings!
            If you had items before or purchased any items and they are not showing up here, please contact an admin.`
          });
        break;
      default:
      // ..
    };
    await interaction.editReply({ embeds: [economyEmbed] });
  }
};