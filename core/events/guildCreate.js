const logger = require('../utils/winstonLogger');
const Discord = require('discord.js');
const { dashboard } = require('../handlers/bootLoader').config;
const fs = require('fs'), { stripIndents } = require('common-tags');
const { name, version } = require('../../package.json');

module.exports = {
  name: 'guildCreate',
  async execute(guild, client) {
    logger.info(`${client.user.tag} joined ${guild.name}!`);
    logger.debug(`Joined ${guild.name} (${guild.id}) Preparing to create settings.`);
    await client.settings.guild.init([guild.id]);
    let welcomeEmbed = require('../assets/resources/welcomeEmbed.json');
    welcomeEmbed.author = client.user;
    welcomeEmbed.thumbnail = client.user.avatarURL;
    welcomeEmbed.description = stripIndents`
      Hi there! My name is Cora. 
      I am packed with features that can help moderate your community, provide interesting images and gifs, play your favourite music in voice channels and more.
      Please take some time to search through my available features and configure me for your server's needs.`;
    welcomeEmbed.fields[0] = {
      name: 'Version Information',
      value: stripIndents`
        Running ${name} v${version}
        Discord.JS ${Discord.version}
      `,
      inline: false
    };
    welcomeEmbed.fields[1] = {
      name: 'New to CoraBot?',
      value: stripIndents`
        Go to my dashboard to customise this guilds settings from [here!](${dashboard.dashDomain || process.env.botDomain})
        As of v4.0, all commands are now application slash '/' commands! To start using a command type '/' in the input field.
      `,
      inline: true
    };
    welcomeEmbed.fields[2] = {
      name: 'Found a bug or unusual glitch?',
      value: stripIndents`
        Make sure you are using the latest version before making a bug report [here!](https://github.com/NovaLynxie/CoraBot_Main/issues)
      `,
      inline: true
    };
    welcomeEmbed.timestamp = new Date();
    try {
      let channel = (guild.systemChannel) ? guild.systemChannel : guild.channels.cache.find(ch => ch.type === 'text');
      logger.debug(`Trying to send welcomeEmbed to channel ${channel.name} (id:${channel.id})`);
      channel.send({ embeds: [welcomeEmbed] });
    } catch (err) {
      logger.warn(`Unable to send bot welcome message in server ${guild.name}!`);
      logger.error(err.message); logger.debug(err.stack);
    };
  },
};