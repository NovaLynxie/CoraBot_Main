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
        announceJoinLeave = await client.settings.get('announceJoinLeave'),
        enablePoints = await client.settings.get('enablePoints'),
        userJoinMsg = await client.settings.get('userJoinMsg', 'Not set'),
        userLeaveMsg = await client.settings.get('userLeaveMsg', 'Not set');
      
      let menu;
      if (menu === 'main') {
        // main settings menu here
        var settingsMainEmbed = new MessageEmbed()
      } else 
      if (menu === 'automod' ) {
        // automod settings menu here
        var autoModSettingsEmbed = new MessageEmbed()
      } else 
      if (menu === 'joinleave') {
        // joinleave settings menu here
        var announcerSettingsEmbed = new MessageEmbed()
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
              Enabled? ${(announceJoinLeave === 'yes') ? 'Yes' : 'No'}`,
            inline: false
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
          name: 'announceJoinLeave',
          value: 'no'
        },
        {
          name: 'enablePoints',
          value: 'no'
        },
        {
          name: 'userJoinMsg',
          value: '<user> joined the server.'
        },
        {
          name: 'userLeaveMsg',
          value: '<user> left the server.'
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