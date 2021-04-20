const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');

module.exports = class BotInfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'avatar',
      aliases: ['av'],
      group: 'util',
      guildOnly: true,
      memberName: 'avatar',
      description: 'Attempts to grab mentioned user\'s pfp.'
    });
  }
  run(message) {
    // Checks if anyone is mentioned, otherwise silently gets author.
    const member = message.mentions.users.first() || message.author;
    const avatarEmbed = new MessageEmbed()
      .setTitle("Avatar Grabber")
      .setColor(0xE7A3F0)
      .setDescription(stripIndents`
        Fetched ${member.username}#${member.discriminator}'s Avatar!`)
      .setImage(member.displayAvatarURL({ format: 'png' }))
      .setTimestamp()
    return message.channel.send(avatarEmbed);
  }
};