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
    // Basic Variable Definitions
    let client = this.client, color = '#FD0061';
    let footermsg = 'Created and maintained by NovaLynxie'
    // Settings Command Functions
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
        },        
        {
          name: 'chatterBoxAI',
          value: {
            enableAutoChat: false,
            chatChannels: []
          }
        },
        {
          name: 'botLogger',
          value: {
            enableBotLogger: false,
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
          name: 'modLogger',
          value: {
            enableModLogger: false,
            logChannels: [],
            ignoreChannels: [],
            logEvents: {
              guildMemberRemove: true
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
    // Fetch all settings here.
    var 
      prefix = client.settings.get('prefix', client.commandPrefix),
      autoChatSettings = client.settings.get('chatterBoxAI', undefined),
      autoModSettings = client.settings.get('autoModerator', undefined),
      autoNotiferSettings = client.settings.get('autoAnnounce', undefined),
      botLoggerSettings = client.settings.get('botLogger', undefined),
      modLoggerSettings = client.settings.get('modLogger', undefined);
    try {
      // Settings Menu Handler.
      switch (option) {
        // Command Actions
        case 'initialize':
          message.channel.send('Generating settings. Please wait...').then(msg=>msg.delete({timeout:5000}))
          generateGuildSettings(message.guild).then(()=>{
            message.reply('Settings generated successfully!')
          })
          break;
        // Command Menus
        case 'autochat':
          // Planned! AutoChat settings menu here.
          message.reply('this menu will come in a future update.');
          break;
        case 'automod': 
          // Deconstruct autoModSettings object here for easier parsing.
          var {enableAutoMod, chListMode, channelsList, urlsBlacklist, mediaOptions} = autoModSettings;
          var {removeGifs, removeImgs, removeUrls, removeVids} = mediaOptions;
          // Prepare AutoMod Settings Embed
          var autoModSettingsEmbed = new MessageEmbed()
            .setTitle('Auto Moderation Settings')
            .setColor(color)
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
          // Deconstruct joinLeaveSettings object here for easier parsing.
          var {announceJoinLeave, userJoinMsg, userLeaveMsg} = autoNotiferSettings;
          // Prepare JoinLeave Settings Embed
          var announcerSettingsEmbed = new MessageEmbed()
            .setTitle('User Join/Leave Announcer')
            .setColor(color)
            .setThumbnail(message.guild.iconURL({format:'png'}))
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
          // Finally send JoinLeave settings embed to message author's channel.
          message.channel.send(announcerSettingsEmbed);
          break;
        default:
          // Fetch only ENABLED status for each of the configurable modules here.
          var 
            {enableAutoChat} = autoChatSettings,
            {announceJoinLeave} = autoNotiferSettings,
            {enableAutoMod} = autoModSettings,
            {enableBotLogger} = botLoggerSettings,
            {enableModLogger} = modLoggerSettings;
          // Settings Main Menu Embed - Fallback if no menus are called first.
          var mainMenuEmbed = new MessageEmbed()
            .setTitle('Guild Settings')
            .setColor(color)
            .setThumbnail(message.guild.iconURL({format:'png'}))
            .setDescription(stripIndents`
              Guild Name: ${message.guild.name}
              Guild ID: ||${message.guild.id}||
              To view any of the settings run this command below.
              \`settings <menu_name>\`
              Menu Options: \`automod, autochat, botlogger*, joinleave*\`
              \*These options are placeholders till the new menus are ready!
              `)
              .addFields(
                {
                  name: 'Bot Modules',
                  value: stripIndents`
                    \`\`\`
                    AutoNotify  | ${(announceJoinLeave===true) ? 'ENABLED' : 'DISABLED'}
                    AutoMod     | ${(enableAutoMod===true) ? 'ENABLED' : 'DISABLED'}
                    ChatterBox  | ${(enableAutoChat===true) ? 'ENABLED' : 'DISABLED'}
                    Bot Logging | ${(enableBotLogger===true) ? 'ENABLED' : 'DISABLED'}
                    \`\`\`
                  `
                }
              )
              .setTimestamp()
              .setFooter(footermsg)
          // Finally send MainMenu settings embed to message author's channel.
          message.channel.send(mainMenuEmbed);
      };
    } catch (err) {
      if (err.message.indexOf('undefined') > -1) {
        logger.debug(`Guild ${message.guild.name} (ID:${message.guild.id}) settings not configured since request returned as undefined.`);
        logger.debug('Requesting user to run initialize command.');
      } else {
        logger.warn('An error occured while requesting data from CoraBot\'s database!');
        logger.error(err); logger.debug(err.stack);
      }      
      message.reply(stripIndents`
        the settings for this server have not yet been configured! 
        Please run \`${prefix} settings initialize\` first to begin setup.`
      );
    };
  };
};