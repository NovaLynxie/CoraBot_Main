const logger = require('../../utils/winstonLogger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const econCore = require('../../plugins/economyCore');

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
    await interaction.deferReply();
    const { guild, member, options } = interaction;
    const subcmd = options.getSubcommand();
    const amount = options.getInteger('amount');
    const target = options.getMember('target');
    const bank = await client.data.economy.get(guild, 'users');
    let user, mode, economyEmbed = new MessageEmbed().setColor('#e39d5f');
    const econUsers = await client.data.economy.get(guild, 'users');
    // TODO - Start implementing bank command!
    switch (subcmd) {
      case 'view':
        user = econUsers[(target) ? target.id : member.id];
        if (!user) {
          economyEmbed
            .setTitle('Economy - Account Error')
            .setDescription(`User ${target || member} either not registered yet or missing data!`);
        } else {
          economyEmbed
            .setTitle('Economy - Account Viewer')
            .setDescription(`
            Name: ${target || member}
            Funds: ${user.balance || 'N/A'}
            `);
        }; break;
      case 'transfer':
        interaction.editReply({ content: 'This is a placeholder message, this subcommand is not yet ready for use.', embeds: [] });
      default:
        logger.verbose('economy.bankCommand.default');
    };
    await interaction.editReply({ embeds: [economyEmbed] });
  }
};