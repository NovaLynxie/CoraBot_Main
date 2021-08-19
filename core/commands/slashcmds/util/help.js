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
    const collector = interaction.channel.createMessageComponentCollector({ time: 30000}); 

    const helpButtons1 = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('allcommands')
          .setLabel('All Commands')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('botsettings')
          .setLabel('Bot Settings')
          .setStyle('SECONDARY'),
        new MessageButton()
          .setLabel('Dashboard')
          .setStyle('LINK')
          .setURL(dashboard.dashDomain),
          new MessageButton()
          .setCustomId('closemenu')
          .setLabel('Close Menu')
          .setStyle('DANGER'),
      );
    
    // Prepare base 'template' object here.
    const baseEmbed = {
      color: '#0099ff',
      title: 'Help Menu',
      description: '',
      fields: [],
      footer: 'Built on Node.js using Discord.js with Commando.',
      thumbnail: client.user.displayAvatarURL({ format: 'png'})
    };
    
    // Declare embed objects here.
    let helpEmbed, cmdsEmbed, settingsEmbed;
    helpEmbed = baseEmbed; cmdsEmbed = baseEmbed; settingsEmbed = baseEmbed;

    helpEmbed.title = 'Help Menu';
    helpEmbed.description = `Hello ${interaction.user.tag}! How may I be of assistance?`;
    helpEmbed.fields = [
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
    
    cmdsEmbed.title = 'Commands Help';
    cmdsEmbed.description = `Here is a list of all my commands ${interaction.user.tag}.`;
    cmdsEmbed.fields = [
      {
        name: 'Feature not yet ready!!',
        value: `
        Argh! This submenu is not yet ready and is under construction.
        It will be available in a future update. Sorry about that. XC - NovaLynxie
        `
      }
    ];

    settingsEmbed.title = 'Bot Settings';
    settingsEmbed.description = `Change the settings for your guild here.`;
    settingsEmbed.fields = [
      {
        name: 'Feature not yet ready!!',
        value: `
        Argh! This submenu is not yet ready and is under construction.
        It will be available in a future update. Sorry about that. XC - NovaLynxie
        `
      }
    ];
    // Internal help menu collector.
    collector.on('collect', async i => {
      switch (i.customId) {
        case 'allcommands':
          await i.deferUpdate();
          await wait(1000);
          await i.editReply(
            {
              content: 'allcommands.button.triggered', 
              embeds: [cmdsEmbed], 
              components: [helpButtons1]
            }
          );
          break;
        case 'botsettings':
          await i.deferUpdate();
          await wait(1000);
          await i.editReply(
            {
              content: 'botsettings.button.triggered', 
              embeds: [settingsEmbed], 
              components: [helpButtons1]
            }
          );
          break;
        case 'closemenu':
          await i.deferUpdate();
          await wait(1000);
          await i.editReply(
            {
              content: 'Help menu closed. Have a nice day! :D',
              embeds: [], components: []
            }
          );
          await wait(5000);
          await i.deleteReply();
          break;
        default: 
          logger.warn('Invalid button pressed for this menu!');
          await i.update(
            {
              content: 'That button is invalid or not recognised in this menu!', 
              embeds: [helpEmbed], 
              components: [helpButtons1]
            }
          );
      };
    });
    // Log on collector end (temporary)
    collector.on('end', collected => logger.debug(`Collected ${collected.size} items`));

    await interaction.reply(
      {
        embeds: [helpEmbed],
        components: [helpButtons1],
      }
    );   
	},
};