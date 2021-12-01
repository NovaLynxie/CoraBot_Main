const logger = require('../../utils/winstonLogger');
const mcsu = require('minecraft-server-util');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mc')
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
    ),
	async execute(interaction, client) {
    await interaction.deferReply();
    const options = interaction.options;
    const type = options.getString('type');
    const host = options.getString('host');
    const port = options.getInteger('port');
    let mcEmbed = new MessageEmbed(), mcOptions = { timeout: 30000, enableSRV: true },  mcServerData;
    if (host.toLowerCase() === 'localhost') return interaction.editReply({ content: "Please don't ping my mainframe. Any `localhost` request is disallowed and will simply be refused."});
    const slowServerResponse = setTimeout(() => {
      logger.debug('Response taking longer than 15s. Is the server lagging or slow connection?')
      interaction.editReply({
        content: 'It looks like the server is taking a very long to respond. If the requested server is running slower than normal, it could be experiencing lag issues due to low TPS.'
    })}, 15000);
    try {
      if (type === 'java') {
        logger.debug(`Pinging MC_JAVA_SERVER at ${host}:${port||25565}.`);
        mcServerData = await mcsu.status(host, port || 25565, mcOptions);
        logger.debug(`Got a response from ${host}:${port||25565}!`);
      };
      if (type === 'bedrock') {
        logger.debug(`Pinging MC_BEDROCK_SERVER at ${host}:${port||19132}.`);
        mcServerData = await mcsu.statusBedrock(host, port || 19132, mcOptions);
        logger.debug(`Got a response from ${host}:${port||19132}!`);
      };
      const { description, motd, players, version, favicon, roundTripLatency } = mcServerData;
      const imgBuff = new Buffer.from(favicon.split(',')[1],'base64');
      const imgData = new MessageAttachment(imgBuff, 'icon.png');
      mcEmbed
        .setTitle('Minecraft Server Utility')
        .setThumbnail('attachment://icon.png')
        .setColor('#836539')
        .setDescription(motd.clean)
        .addFields(
          {
            name: 'Statistics',
            value: stripIndents`
              Players: ${players.online}/${players.max}
              Version: ${version.name}
              Protocol: ${version.protocol}
            `
          }
        )
      await interaction.editReply({
        embeds: [mcEmbed], files: [imgData]
      });
      await clearTimeout(slowServerResponse);
    } catch (err) {
      logger.debug(err.stack);
      mcEmbed
        .setTitle('Minecraft Server Utility')
        .setColor('#855038')
        .setDescription(stripIndents`
          An error occured while getting server information.
          \`${err.message}\`
          Please check the IP you entered and try again.
          If this error persists and you are sure the server IP is correct, it may be offline or is not responding.
        `)
      await interaction.editReply({
        embeds: [mcEmbed]
      });
    };
	},
};