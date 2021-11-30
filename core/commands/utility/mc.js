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
        .setDescription('Pings the server IP and waits for response.')
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
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('query')
        .setDescription('Queries the server IP for information. (JAVA ONLY!)')
        .addStringOption(option =>
          option
            .setName('request')
            .setDescription('Basic or Full')
            .setRequired(true)
            .addChoice('Basic','basic')
            .addChoice('Full','full')
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
    const request = options.getString('request');
    const type = (subcmd === 'query') ? 'java' : options.getString('type');
    const host = options.getString('host');
    const port = options.getInteger('port');
    const cfg = { timeout: 5000, enableSRV: true };
    let mcServerPingData, mcServerQueryData, mcOptions = {};
    let mcEmbed = new MessageEmbed(), imgBuff, imgData;
    if (host.toLowerCase() === 'localhost') return interaction.editReply({ content: "Please don't ping my mainframe. Any `localhost` request is disallowed and will simply be refused."});
    try {      
      switch (type) {
        case 'java':
          mcOptions = { timeout: 10000, enableSRV: true };
          if (subcmd === 'ping') {
            mcServerPingData = await mcu.status(host, mcOptions, port);
          };
          if (subcmd === 'query') {
            if (request === 'full') {
              mcServerQueryData = await mcu.queryFull(host, mcOptions, port);
            } else {
              mcServerQueryData = await mcu.queryBasic(host, mcOptions, port);
            };
          };
          break;
        case 'bedrock':
          mcOptions = { timeout: 10000, enableSRV: true };
          mcServerPingData = await mcu.statusBedrock(host, mcOptions, port);
          break;
      };
      mcEmbed 
        .setTitle('Minecraft Server')
        .setThumbnail('attachment://icon.png')
        .setColor('#836539')
      if (mcServerPingData) {
        const { description, onlinePlayers, maxPlayers, version, protocolVersion, favicon, roundTripLatency } = mcServerPingData;
        imgBuff = new Buffer.from(favicon.split(',')[1],'base64');
        imgData = new MessageAttachment(imgBuff, 'icon.png');        
        mcServerResponse = {
          name: 'Statistics',
          value: stripIndents`
            Players: ${onlinePlayers}/${maxPlayers}
            Version: ${version}
            Protocol: ${protocolVersion}
            Latency: ${roundTripLatency}ms
          `
        };
        mcEmbed
          .setDescription(description.descriptionText)
          .addFields(mcServerResponse)
      };
      if (mcServerQueryData) {  
        const { favicon } = mcServerQueryData;
        imgBuff = new Buffer.from(favicon.split(',')[1],'base64');
        imgData = new MessageAttachment(imgBuff, 'icon.png');
        if (request === 'full') {
          mcServerResponse = {
            name: 'Query Data [FULL]',
            value: stripIndents`
              
            `
          };
        } else {
          mcServerResponse = {
            name: 'Query Data [BASIC]',
            value: stripIndents`
              
            `
          };
        };
        mcEmbed.addFields(mcServerResponse);
      };
      logger.debug(JSON.stringify(mcServerQueryData,null,2));
      await interaction.editReply({
        embeds: [mcEmbed], files: [imgData]
      });
    } catch (err) {
      logger.debug(err.stack);
      mcEmbed
        .setTitle('Minecraft Server')
        .setColor('#855038')
        .setDescription(stripIndents`
          An error occured while getting server information.
          > ${err.message}
          Please check the IP you entered and try again.
          If this error persists and you are sure the server IP is correct, it may simply be down or is not responding.
        `)
      await interaction.editReply({
        embeds: [mcEmbed]
      });
    };
	},
};