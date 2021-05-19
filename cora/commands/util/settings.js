const { Command } = require('discord.js-commando');
const { stripIndents, oneLine } = require('common-tags');
const { MessageEmbed } = require('discord.js');

module.exports = class SettingsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'settings',
      aliases: ['s'],
      group: 'util',
      guildOnly: true,
      memberName: 'settings',
      description: 'Allows for altering some settings without restarting the bot.',
      args: [
        {
          key: 'option',
          prompt: 'settings.option.prompt',
          type: 'string',
          default: ''
        }
      ]
    });
  }
  run(message, { option }) {
    function settingsEmbed () {
      var embed = new MessageEmbed()
        .setTitle('Settings')
        .setDescription(stripIndents`
        CoraBot's current settings for ${message.guild.name}
        (SETTINGS NOT YET AVAILABLE! VERY WIP!)`)

    };
    switch (option) {
      case 'initialize':

        break;
      case 'welcome-message': 

        break;
      default:
        settingsEmbed();
    }
  }
};