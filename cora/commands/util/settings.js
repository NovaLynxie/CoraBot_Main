const { Command } = require('discord.js-commando');
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
          default: ''
        }
      ]
    });
  }
  run(message, { option }) {
    function settingsEmbed () {
      
    };
    switch (option) {
      case 'initialize':
      
      break;
      case 'welcome-message': 

      break;
      default:
      message.channel.send('No option provided.')
    }
  }
};