const logger = require('../../utils/winstonLogger');
const mcu = require('minecraft-server-util');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mc')
		.setDescription('Minecraft Utility Command.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('ping')
        .setDescription('Pings specified server IP and address.')
        .addStringOption(option =>
          option
            .setName('type')
            .setDescription('Java or Bedrock')
            .setRequired(true)
            .addChoice('Java','java')
            .addChoice('Bedrock','bedrock')
        )
        .addStringOption(option =>
          option
            .setName('host')
            .setDescription('Host IP')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName('port')
            .setDescription('Port')
            .setRequired(false)
        )
    ),
	async execute(interaction, client) {
    await interaction.deferReply();
    const defaultPorts = { 'java': 25565, 'bedrock': 19132 };
    const options = interaction.options;
    const subcmd = options.getSubcommand();
    const type = options.getString('type');
    const host = options.getString('host');
    const port = options.getInteger('port');
    const cfg = { timeout: 5000, enableSRV: true };
    let mcServerData, mcOptions = {};
    try {
      switch (type) {
        case 'java':
          mcOptions = { timeout: 5000, enableSRV: true };
          mcServerData = await mcu.status(host, mcOptions, port);
          break;
        case 'bedrock':
          mcOptions = { enableSRV: true };
          mcServerData = await mcu.statusBedrock(host, mcOptions, port);
          break;
        default:
          // ..
      };
    } catch (err) {
      logger.error(err); logger.debug(err.stack);
      return interaction.editReply({
        content: 'Error occured while getting information!',
        ephemeral: true
      });
    };    
    const { description, onlinePlayers, maxPlayers, version, protocolVersion, favicon, roundTripLatency } = mcServerData;
    const imgBuff = new Buffer.from(favicon.split(',')[1],'base64');
    const imgData = new MessageAttachment(imgBuff, 'icon.png');
    const mcEmbed = new MessageEmbed()
      .setTitle('Minecraft Server')
      .setThumbnail('attachment://icon.png')
      .setColor('#836539')
      .setDescription(description.descriptionText)
      .addFields(
        {
          name: 'Statistics',
          value: stripIndents`
            Players: ${onlinePlayers}/${maxPlayers}
            Version: ${version}
            Protocol: ${protocolVersion}
            Latency: ${roundTripLatency}ms
          `
        }
      )
    await interaction.editReply({
      embeds: [mcEmbed], files: [imgData]
    });
	},
};