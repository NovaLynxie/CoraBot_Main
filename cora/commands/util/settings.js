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
      var 
        announceJoinLeave = await client.settings.get('announceJoinLeave', 'N/A'),
        enablePoints = await client.settings.get('enablePoints', 'N/A'),
        userJoinMsg = await client.settings.get('userJoinMsg', 'N/A'),
        userLeaveMsg = await client.settings.get('userLeaveMsg', 'N/A');
      
      let menu;
      if (menu === 'main') {
        // main settings menu here
        var settingsMainEmbed = new MessageEmbed()
          .setTitle('Guild Settings')
          .setDescription(stripIndents`
            Guild Name: ${message.guild.name}
            Guild ID: ||${message.guild.id}||
            To view any of the settings run this command below.
            \`settings <menu_name>\`
            `)
      } else 
      if (menu === 'automod' ) {
        // automod settings menu here
        var
          autoModSettings = await client.settings.get('autoModerator')
        /*
        var autoModSettingsEmbed = new MessageEmbed()
          .setTitle('Auto Moderation')
          .setDescription(stripIndents`
            This module automatically monitors channels for specific media types allowing your staff and you to relax and focus on other things.
            It handles most supported image types, urls so you can control which channels to post them in!
          `)
          .addFields(
            {
              name: 'Enable AutoMod',
              value: `Status: ${(enableAutoMod === (true||'yes')) ? 'ENABLED':'DISABLED'}`
            },
            {
              name: 'Channel List Mode',
              value: `Mode: ${channelListMode}`
            },
            {
              name: 'URLs List Mode',
              value: `Mode: ${urlsListMode}`,
              inline: true              
            },
            {
              name: 'Channels List',
              value: stripIndents`
              \`\`\`md
              ${channelsList.join('\n')}
              \`\`\``,
            },
            {
              name: 'Blocked URLs',
              value: stripIndents`
              \`\`\`md
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
        */
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
      } else {
        //return message.channel.send("settings.menuHandler.unrecognised_err");
      }
      // Settings Embed. Shows all current settings.
      var settingsEmbed = new MessageEmbed()
        .setTitle('Guild Settings')
        .setDescription(stripIndents`
          Guild Name: ${message.guild.name}
          Guild ID: ||${message.guild.id}||`)
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
      return message.channel.send(settingsEmbed);
      
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