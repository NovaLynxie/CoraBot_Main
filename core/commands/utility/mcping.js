const logger = require('../../utils/winstonLogger');
//const mcsu = require('minecraft-server-util'); 
const fetch = require('node-fetch');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const mcstats = {
  java: "https://api.mcsrvstat.us/2",
  bedrock: "https://api.mcsrvstat.us/bedrock/2"
};
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
    const srvPortDefaults = { 'bedrock': 19132, 'java': 25565 };
    const type = options.getString('type');
    const host = options.getString('host');
    const port = options.getInteger('port') || srvPortDefaults[type];
    let mcEmbed = new MessageEmbed(), mcOptions = { timeout: 30000, enableSRV: true },  mcSrvData;
    if (host.toLowerCase() === 'localhost') return interaction.editReply({ content: "Please don't ping my mainframe. Any `localhost` request is disallowed and will simply be refused."});
    const slowServerResponse = setTimeout(() => {
      logger.debug('Response taking longer than 15s. Is the server lagging or slow connection?')
      interaction.editReply({
        content: 'It looks like the server is taking a very long to respond. If the requested server is running slower than normal, it could be experiencing lag issues due to low TPS.'
    })}, 15000);
    mcEmbed.setTitle('Minecraft Server Utility');
    try {
      if (type === 'java') {
        logger.debug(`Pinging MC_JAVA_SERVER at ${host}:${port}.`);
        mcSrvData = await fetch(`${mcstats.java}/${host}:${port}`)
        mcSrvData = await mcSrvData.json();
        //mcSrvData = await mcsu.status(host, port || 25565, mcOptions);
        logger.debug(`Got a response from ${host}:${port}!`);
      };
      if (type === 'bedrock') {
        logger.debug(`Pinging MC_BEDROCK_SERVER at ${host}:${port}.`);
        mcSrvData = await fetch(`${mcstats.bedrock}/${host}:${port}`);
        mcSrvData = await mcSrvData.json();
        //mcSrvData = await mcsu.statusBedrock(host, port || 19132, mcOptions);
        logger.debug(`Got a response from ${host}:${port}!`);
      };
      const {
        online, motd, players, version, protocol, icon, software, map, gamemode, plugins, mods
      } = mcSrvData;
      //const { description, motd, players, version, favicon, roundTripLatency } = mcSrvData;
      let imgBuff, imgData, iconURL;
      if (icon) {
        imgBuff = new Buffer.from(icon.split(',')[1],'base64');
        imgData = new MessageAttachment(imgBuff, 'icon.png');
      } else {
        iconURL = 'https://via.placeholder.com/64.png/?text=Server';
      };
      mcEmbed
        .setThumbnail(icon ? 'attachment://icon.png' : iconURL)
        .setColor('#836539')
        .setDescription(motd.clean[0])
        .addFields(
          {
            name: 'Statistics',
            value: stripIndents`
              Players: ${players.online}/${players.max}
              Version: ${version}
              Protocol: ${protocol}
            `
          }
        )
      clearTimeout(slowServerResponse);
      await interaction.editReply({
        embeds: [mcEmbed], files: (icon) ? [imgData] : null
      });
    } catch (err) {
      logger.debug(err.stack);
      mcEmbed
        .setColor('#855038')
        .setDescription(stripIndents`
          An error occured while getting server information.
          \`${err.message}\`
          Please check the IP you entered and try again.
          If this error persists and you are sure the server IP is correct, it may be offline or is not responding.
        `)
      clearTimeout(slowServerResponse);
      await interaction.editReply({
        embeds: [mcEmbed]
      });
    };
	},
};