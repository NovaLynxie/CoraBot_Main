const { Command } = require('discord.js-commando');
const { stripIndents } = require('common-tags');
const { MessageEmbed } = require('discord.js');
const logger = require('../../providers/WinstonPlugin');
const fs = require('fs');

module.exports = class SettingsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'settings',
      aliases: ['s'],
      group: 'util',
      guildOnly: true,
      memberName: 'settings',
      description: 'Allows for altering some settings without restarting the bot.',
      details: stripIndents`
        This command allows for altering guild specific settings without needing to restart the bot. 
        From here you can modify and tweak how each module works per server, allowing your staff and you to customise them how you want!
        It is for **guild specific** settings only, for this bot's settings, please check the config files.`,
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
    async function resetGuildSettings(guild) {
      // Removes and reset all settings.
      guild.settings.clear();
      let defaultSettings = fs.readFileSync('./cora/assets/text/defaultSettings.txt', 'utf-8');
      defaultSettings.forEach(setting => {
        logger.data(`Generating setting ${setting.name} for ${guild.name}`)
        guild.settings.set(setting.name, setting.value).then(logger.debug(`Saved ${setting.name} under ${guild.name}`));
      });
    }
    async function updateSetting(key, value) {
      // Updates current setting value with new setting value.
      logger.debug(`Updating setting ${key}`)
      logger.data(`setting name: ${key} value:`); logger.data(value);
      message.guild.settings.set(key, value);
      logger.info(`Updated settings for guild ${message.guild.name}!`)
      message.channel.send("Updated this guild's settings successfully.")
    }
    async function removeListSingleItem(array, key, value) {
      // Remove one occurence of item entry in setting array object.
      logger.debug(`Removing ${value} from ${key}`);
      logger.data(`Old ${key} data:`); logger.data(array);
      let pos = array.indexOf(value);
      if (pos > -1) {
        array.splice(pos, 1);
      }
      logger.data(`New ${key} data:`); logger.data(array);
      return array;
    }
    async function removeListMultipleItems(array, key, value) {
      // Remove one occurence of item entry in setting array object.
      logger.debug(`Removing ${value} from ${key}`);
      logger.data(`Old ${key} data:`); logger.data(array);
      let pos = 0, x = array.length;
      while (pos < array.length) {
        if (array[pos] === value) {
          array.splice(pos, 1);
        } else {
          pos++;
        }
      }
      let y = array.length;
      logger.debug(`Removed a total of ${x-y} entries from ${key}.`)
      logger.data(`New ${key} data:`); logger.data(array);
      return array;
    }
    // Fetch all settings here.
    var 
      prefix = client.settings.get('prefix', client.commandPrefix),
      autoChatSettings = message.guild.settings.get('chatbot', undefined),
      autoModSettings = message.guild.settings.get('automod', undefined),
      autoNotiferSettings = message.guild.settings.get('announcer', undefined),
      botLoggerSettings = message.guild.settings.get('botlogger', undefined),
      modLoggerSettings = message.guild.settings.get('modlogger', undefined);
    logger.data(`prefix: ${prefix}`);
    logger.data(`autochat: ${autoChatSettings}`);
    logger.data(`automod: ${autoModSettings}`);
    logger.data(`notifier: ${autoNotiferSettings}`);
    logger.data(`botlogger: ${botLoggerSettings}`);
    logger.data(`modlogger: ${modLoggerSettings}`);
    try {
      // Settings Menu Handler.
      switch (option) {
        // Command Actions
        case 'reset':
          resetGuildSettings(message.guild).then(()=>{
            message.reply('Settings reset successfully!')
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

          let args = input.split(',');
          logger.debug(`args = ${args} (${typeof args})`)
          if (args[0] === 'toggle') {
            if (args[1] === 'chListMode') {
              autoModSettings.chListMode = (chListMode==='whitelist')?'blacklist':'whitelist';
            }
            autoModSettings.enableAutoMod = !enableAutoMod;
            updateSetting('autoModerator', autoModSettings); // Run settings update here.
          } else 
          if (args[0] === 'add') {
            if (args[1] === 'channelsList') {
              let chIDs = args.splice(1, args.length() - 1);
              autoModSettings.channelsList.push(chIDs);
            } else
            if (args[1] === 'urlsBlacklist') {
              let urls = args.splice(1, args.length() - 1);
              autoModSettings.urlsBlacklist.push(urls);
            }
            updateSetting('autoModerator', autoModSettings); // Run settings update at the end here.
          } else {
            // Prepare AutoMod Settings Embed
            logger.data(autoModSettings);
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
          }
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
            {enableChatBot} = autoChatSettings,
            {enableNotifier} = autoNotiferSettings,
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
              Menu Options: \`autonotifs*, automod, autochat, botlogger*, modlogger, \`
              \*Some of these options are not yet fully implemented!
              `)
              .addFields(
                {
                  name: 'Bot Modules',
                  value: stripIndents`
                    \`\`\`
                    AutoNotify  | ${(enableNotifier===true) ? 'ENABLED' : 'DISABLED'}
                    AutoMod     | ${(enableAutoMod===true) ? 'ENABLED' : 'DISABLED'}
                    ChatterBox  | ${(enableChatBot===true) ? 'ENABLED' : 'DISABLED'}
                    Bot Logging | ${(enableBotLogger===true) ? 'ENABLED' : 'DISABLED'}
                    Mod Logging | ${(enableModLogger===true) ? 'ENABLED' : 'DISABLED'}
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
        logger.debug(`Guild ${message.guild.name} (ID:${message.guild.id}) settings not configured since request returned one or more settings as 'undefined'.`);
        logger.debug('Requesting user action to resolve this error.');
      } else {
        logger.warn('An error occured while requesting data from CoraBot\'s database!');
        logger.error(err); logger.debug(err.stack);
      }      
      message.reply(stripIndents`
        the settings for this server have not yet been configured or are missing!
        This should not happen as it should generate on bot join. 
        Try running \`${prefix} settings reset\` to reconfigure with default settings. If this does not work, contact my owner.`
      );
    };
  };
};