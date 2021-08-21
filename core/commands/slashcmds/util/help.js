const { MessageActionRow, MessageButton } = require('discord.js');
const logger = require('../../../plugins/winstonplugin');
const wait = require('util').promisify(setTimeout);
const {config} = require('../../../handlers/bootloader'); const {dashboard} = config;
module.exports = {
  data: {
    name: 'help',
    category: 'util',
    description: "Provides a useful help embed and button menu!"
  },
	async execute(interaction, client) {
    const buttonIDs = ['allcommands', 'botsettings'];
    const filter = i => buttonIDs.indexOf(i.customId);
    const collector = interaction.channel.createMessageComponentCollector({ time: 60000}); 
    logger.debug(JSON.stringify(dashboard));

    let {dashDomain,dashSrvPort} = dashboard;
    dashDomain = (dashDomain && dashDomain === '') ? dashDomain : `https://localhost:${dashSrvPort}`
    const helpMainMenuBtns = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('helpindex')
          .setLabel('Main Menu')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('allcommands')
          .setLabel('All Commands')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setLabel('Dashboard')
          .setStyle('LINK')
          .setURL(dashDomain),
          new MessageButton()
          .setCustomId('closemenu')
          .setLabel('Close Menu')
          .setStyle('DANGER'),
      );
    
    // Prepare base 'template' object here.
    const baseEmbed = {
      color: '#0099ff',
      title: '',
      description: '',
      fields: [],
      footer: 'Built on Node.js using Discord.js with Commando.',
      thumbnail: client.user.displayAvatarURL({ format: 'png'})
    };
    
    // Dynamically create embed here on call and return as an embed object.
    function dynamicEmbeds(menu, embed) {
      switch(menu) {
        case 'help':
          embed.title = 'Help Menu';
          embed.description = `Hello ${interaction.user.tag}! How may I be of assistance?`;
          embed.fields = [
            {
                name: 'Commands (WIP)',
                value: `
                This lists all the prefix and slash commands.
                Tap the 'Commands' button to open the help menu.
                `
              },
              {
                name: 'Settings (WIP)',
                value: `
                Configure the bot prefix, modules and other options from here.
                Tap the settings button to open the menu.
                `
              },
              {
                name: 'Dashboard (WIP)',
                value: `
                You can use the dashboard to configure the bot, join or leave any server you are linked to!
                Tap the Dashboard button to bring you to the web dashboard.
                `
              }
          ];
          break;
        case 'cmds': 
          embed.title = 'Commands Help';
          embed.description = `Here is a list of all my commands ${interaction.user.tag}.`;
          embed.fields = [
            {
              name: 'Feature not yet ready!!',
              value: `
              Argh! This submenu is not yet ready and is under construction.
              It will be available in a future update. Sorry about that. XC - NovaLynxie
              `
            }
          ];
          break;
        default:
          logger.debug(`Embed ${menu} not found! Silently ignored as INVALID_EMBED_MENU.`);
      };
      return embed;
    }
    
    // Internal help menu collector.
    collector.on('collect', async i => {
      switch (i.customId) {
        case 'helpindex': 
          await i.deferUpdate();
          await wait(1000);
          await i.editReply(
            {
              embeds: [dynamicEmbeds('help', baseEmbed)],
              components: [helpMainMenuBtns]
            }
          );
          break;
        case 'allcommands':
          
          await i.deferUpdate();
          await wait(1000);
          await i.editReply(
            {
              embeds: [dynamicEmbeds('cmds', baseEmbed)], 
              components: [helpMainMenuBtns]
            }
          );
          break;
        case 'closemenu':
          await i.deferUpdate();
          await wait(1000);
          await i.editReply(
            {
              content: 'Help menu has been closed. Run /help to re-open the help menu at any time.',
              embeds: [], components: []
            }
          );
          await wait(5000);
          await i.deleteReply();
          break;
        default: 
          logger.warn('Invalid button pressed for this menu!');
          console.log('button.default.trigger')
          await i.update(
            {
              content: 'That button is invalid or not recognised in this menu!', 
              embeds: [helpEmbed], 
              components: [helpMainMenuBtns]
            }
          );
      };
    });
    // Log on collector end (temporary)
    collector.on('end', async collected => {
      logger.debug('Collector in help commmand timed out.');
      logger.debug(`Collected ${collected.size} items.`);
    });
    // Send this part.    
    await interaction.reply(
      {
        embeds: [dynamicEmbeds('help', baseEmbed)],
        components: [helpMainMenuBtns],
      }
    );   
	},
};