const { Command } = require('discord.js-commando');
const { stripIndents, oneLine } = require('common-tags');
const { MessageEmbed } = require('discord.js');
const logger = require('../../providers/WinstonPlugin');

module.exports = class SettingsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'settings',
      aliases: ['s'],
      group: 'util',
      guildOnly: true,
      memberName: 'settings',
      description: 'Allows for altering some settings without restarting the bot.',
      throttling: {
        usages: 1,
        duration: 5,
      },
      args: [
        {
          key: 'option',
          prompt: 'settings.option.prompt',
          type: 'string',
          default: ''
        },
        {
          key: 'input',
          prompt: 'settings.input.prompt',
          type: 'string',
          default: ''
        }
      ]
    });
  }
  async run(message, { option, input }) {
    let client = this.client;
    async function settingsMenu() {
      // Depreciated. These settings have been removed as of CoraBot v2.5.0
      // This and old embed be removed in future versions (v2.5.1+)
      var 
        announceJoinLeave = await client.settings.get('announceJoinLeave', 'N/A'),
        enablePoints = await client.settings.get('enablePoints', 'N/A'),
        userJoinMsg = await client.settings.get('userJoinMsg', 'N/A'),
        userLeaveMsg = await client.settings.get('userLeaveMsg', 'N/A');
      let footermsg = 'Created and maintained by NovaLynxie'
      let menu;
      if (menu === 'botlogger') {
        // Planned! BotLogger settings menu here.
        message.reply('this menu will come in a future update.');
      } else
      if (menu === 'autochat') {
        // Planned! AutoChat settings menu here.
        message.reply('this menu will come in a future update.');
      } else 
      if (menu === 'automod') {
        // Fetch AutoMod Settings Here:
        var
          autoModSettings = await client.settings.get('autoModerator'),
          {enableAutoMod, chListMode, urlsBlacklist, mediaOptions} = autoModSettings,
          {removeGifs, removeImgs, removeUrls, removeVids} = mediaOptions;
        // Prepare AutoMod Settings Embed
        var autoModSettingsEmbed = new MessageEmbed()
          .setTitle('Auto Moderation Settings')
          .setThumbnail(message.guild.iconURL({format:'png'}))
          .setDescription(stripIndents`
            This module automatically monitors channels for specific media types allowing your staff and you to relax and focus on other things.
            It handles most supported image types, urls so you can control which channels to post them in!
          `)
          .addFields(
            {
              name: 'Enable AutoMod',
              value: `Status: ${(enableAutoMod) ? 'ENABLED':'DISABLED'}`
            },
            {
              name: 'Channel List Mode',
              value: `Mode: ${(chListMode === 'whitelist') ? 'WHITELIST' : 'BLACKLIST' }`
            },
            {
              name: 'Channels List',
              value: stripIndents`
              \`\`\`
              ${channelsList.join('\n')}
              \`\`\``,
              inline: true
            },
            {
              name: 'Blocked URLs',
              value: stripIndents`
              \`\`\`
              ${urlsBlacklist.join('\n')}
              \`\`\``,
              inline: true
            },
            {
              name: 'Media Settings',
              value: stripIndents`
                > Detection options.
                Gifs   | ${(removeGifs === 'yes') ? 'Yes' : 'No'}
                Links  | ${(removeURLs === 'yes') ? 'Yes' : 'No'}
                Images | ${(removeImgs === 'yes') ? 'Yes' : 'No'}
                Videos | ${(removeVids === 'yes') ? 'Yes' : 'No'}
              `
            }
          )
          .setTimestamp()
          .setFooter(footermsg)
        // Finally send AutoMod settings embed to message author's channel.
        return message.channel.send(autoModSettingsEmbed);
      } else 
      if (menu === 'joinleave') {
        // joinleave settings menu here
        var announcerSettingsEmbed = new MessageEmbed()
          .setTitle('User Join/Leave Announcer')
          .addFields(
            {
              name: 'Announce Member Join/Leave',
              value: stripIndents`
                Enabled? ${(announceJoinLeave === 'yes') ? 'Yes' : 'No'}`
            },          
            {
              name: 'User Join Message',
              value: userJoinMsg,
              inline: true
            },
            {
              name: 'User Leave Message',
              value: userLeaveMsg,
              inline: true
            }
          )
          .setTimestamp()
          .setFooter(footermsg)
        // Finally send AutoMod settings embed to message author's channel.
        return message.channel.send(announcerSettingsEmbed);
      } else {
        // Settings Main Menu Embed - Fallback if no menus are called first.
        var mainMenuEmbed = new MessageEmbed()
          .setTitle('Guild Settings')
          .setThumbnail(message.guild.iconURL({format:'png'}))
          .setDescription(stripIndents`
            Guild Name: ${message.guild.name}
            Guild ID: ||${message.guild.id}||
            To view any of the settings run this command below.
            \`settings <menu_name>\`
            Available menus are \`automod, autochat, joinleave\`
            `)
            .setTimestamp()
            .setFooter(footermsg)
        // Finally send MainMenu settings embed to message author's channel.
        return message.channel.send(mainMenuEmbed);
      };      
    };
    async function settingsHandler(mode, setting, value) {
      if (mode === 'write') {
        client.settings.set(setting, value);
        return;
      } else 
      if (mode === 'read') {
        let res = await client.settings.get(setting);
        return res;
      };
    };
    async function generateGuildSettings(guild) {
      let defaultSettings = [
        {
          name: 'autoAnnounce',
          value: {
            announceJoinLeave: false,
            userJoinMsg: '<user> joined the server.',
            userLeaveMsg: '<user> left the server.'
          }
        },
        {
          name: 'aiChatModule',
          value: {
            enableAutoChat: false,
            chatChannels: []
          }
        },
        {
          name: 'autoLogger',
          value: {
            enableLogger: false,
            logChannels: [],
            ignoreChannels: [],
            logEvents: {
              messageUpdates: true,
              userJoinLeave: true,
              userRoleUpdate: true
            }
          }
        },
        {
          name: 'autoModerator',
          value: {
            enableAutoMod: false,
            chListMode: 'whitelist',
            channelsList: [],
            urlBlackList: [],
            mediaOptions: {
              removeGifs: false,
              removeImgs: false,
              removeUrls: false
            }
          }
        }
      ]
      defaultSettings.forEach(setting => {
        logger.data(`Generating setting ${setting.name} for ${guild.name}`)
        client.settings.set(setting.name, setting.value).then(logger.debug(`Saved ${setting.name} under ${guild.name}`));
      });
    }
    async function updateSetting(key, value) {
      client.settings.set(key, value);
    }
    async function fetchSettings() {
      let res = {};
      let curSettings = ['user-join-msg', 'user-leave-msg']
      curSettings.forEach(async item => {
        res[item] = await client.settings.get(item, 'n/a')
      })
      return res;
    };
    switch (option) {
      case 'initialize':
        generateGuildSettings(message.guild);
        break;
      case 'joinmsg': 
        await settingsHandler('user-join-msg', input);
        break;
      case 'leavemsg':
        await settingsHandler('user-leave-msg', input);
      default:
        settingsMenu();
    }
  }
};