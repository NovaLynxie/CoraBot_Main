const logger = require('../../utils/winstonLogger');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Economy = require('../../plugins/economyCore');

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
    let mode, economyEmbed = new MessageEmbed().setColor('#e36a5f');
    try {
      if (subcmd === 'list') mode = 'view_shop';
      let { economy, response } = await Economy(client, mode, { amount, itemId, executorId: member.id });
      if (response.status.startsWith('ERROR')) {
        // TODO - Implement error handling for Economy Shop!
        let errEmbed = new MessageEmbed(economyEmbed)
          .setTitle('Economy Core Error!')
          .setDescription(`The request errored or was rejected.
          \`\`\`
          Status: ${response.status}
          Message: ${response.message}
          \`\`\`
          `)
        await interaction.editReply({ embeds: [errEmbed] });
      } else {
        // TODO - Handle response data correctly.
        let shopEmbed = new MessageEmbed(economyEmbed)
          .setTitle('Guild Shop Listings');
          .add
        await interaction.editReply({ embeds: [shopEmbed] });
      };
    } catch (error) {
      logger.debug(error.stack);
      await interaction.editReply({
        embeds: [await client.utils.embeds.system('error', { error })]
      });      
    };
  }
};