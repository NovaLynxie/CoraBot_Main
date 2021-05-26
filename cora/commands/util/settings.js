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
    function settingsEmbed() {
      var embed = new MessageEmbed()
        .setTitle('Settings')
        .setDescription(stripIndents`
        CoraBot's current settings for ${message.guild.name}
        (SETTINGS NOT YET AVAILABLE! VERY WIP!)`)
      return message.channel.send(embed);
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
          name: 'user-join',
          value: '<user> joined the server.'
        },
        {
          name: 'user-leave',
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
      let curSettings = ['user-join', 'user-leave']
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
        await settingsHandler('welcome-message', input);
        break;
      case 'leavemsg':
        await settingsHandler('leave-message', input);
      default:
        message.channel.send("Loading your guild's settings... please wait.").then(msg => {
          message.delete({timeout: 3000});
        })
        settingsEmbed();
    }
  }
};