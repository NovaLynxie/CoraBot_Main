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
    let footermsg = 'Created and maintained by NovaLynxie'

    // might need this after all...
    /*
    async function settingsMenu() {
      
      if (option === 'botlogger') {
        // Planned! BotLogger settings menu here.
        message.reply('this menu will come in a future update.');
      } else
      if (option === 'autochat') {
        // Planned! AutoChat settings menu here.
        message.reply('this menu will come in a future update.');
      } else 
      if (option === 'automod') {
        
      } else 
      if (option === 'joinleave') {
        
      } else {
      
    };
    */
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
      // Command Actions
      case 'initialize':
        generateGuildSettings(message.guild);
        break;
      // Command Menus
      case 'autochat':
        // Planned! AutoChat settings menu here.
        message.reply('this menu will come in a future update.');
        break;
      case 'automod': 
        // Fetch AutoMod Settings Here:
        var autoModSettings = client.settings.get('autoModerator');
        var {enableAutoMod, chListMode, channelsList, urlsBlacklist, mediaOptions} = autoModSettings;
        var {removeGifs, removeImgs, removeUrls, removeVids} = mediaOptions;
        // Prepare AutoMod Settings Embed
        var autoModSettingsEmbed = new MessageEmbed()
          .setTitle('Auto Moderation Settings')
          .setThumbnail(message.guild.iconURL({format:'png'}))
          .setDescription(stripIndents`
            This module automatically monitors channels for specific media types allowing your staff and you to relax and focus on other things.
            It handles most supported media types, urls and links so you can control which channels members can post them in!
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
              ${(channelsList) ? channelsList.join('\n') : 'Not set'}
              \`\`\``,
              inline: true
            },
            {
              name: 'Blocked URLs',
              value: stripIndents`
              \`\`\`
              ${(urlsBlacklist) ? urlsBlacklist.join('\n') : 'Not set'}
              \`\`\``,
              inline: true
            },
            {
              name: 'Media Settings',
              value: stripIndents`
                > Detection options.
                \`\`\`
                Gifs   | ${(removeGifs === 'yes') ? 'Yes' : 'No'}
                Links  | ${(removeUrls === 'yes') ? 'Yes' : 'No'}
                Images | ${(removeImgs === 'yes') ? 'Yes' : 'No'}
                Videos | ${(removeVids === 'yes') ? 'Yes' : 'No'}
                \`\`\`
              `
            }
          )
          .setTimestamp()
          .setFooter(footermsg)
        // Finally send AutoMod settings embed to message author's channel.
        message.channel.send(autoModSettingsEmbed);
        break;
      case 'botlogger':
        // Planned! BotLogger settings menu here.
        message.reply('this menu will come in a future update.');
        break;
      case 'joinleave':
        // joinleave settings menu here
        var joinLeaveSettings = client.settings.get('joinleave')
        var {announceJoinLeave, userJoinMsg, userLeaveMsg} = joinLeaveSettings;
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
        message.channel.send(announcerSettingsEmbed);
        break;
      default:
        // Settings Main Menu Embed - Fallback if no menus are called first.
        var mainMenuEmbed = new MessageEmbed()
          .setTitle('Guild Settings')
          .setThumbnail(message.guild.iconURL({format:'png'}))
          .setDescription(stripIndents`
            Guild Name: ${message.guild.name}
            Guild ID: ||${message.guild.id}||
            To view any of the settings run this command below.
            \`settings <menu_name>\`
            Menu Options: \`automod, autochat, botlogger*, joinleave*\`
            \*These options are placeholders till the new menus are ready!
            `)
            .setTimestamp()
            .setFooter(footermsg)
        // Finally send MainMenu settings embed to message author's channel.
        message.channel.send(mainMenuEmbed);
    };
  };
};