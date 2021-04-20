const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
module.exports = class BotInfoCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'botinfo',
            aliases: ['aboutme'],
            group: 'info',
            memberName: 'botinfo',
            description: 'Displays some information about the bot.',
        });
    }
    run(message) {
        const embed = new MessageEmbed()
            .setTitle("About Me")
            .setColor(0xE7A3F0)
            .setDescription(stripIndents`
            Hi there! My name is Cora, I am a multi-purpose Discord bot built on Discord.JS with Commando.`)
            .addFields(
                {
                    name: "A little bit about myself",
                    value: stripIndents`
                    A while back, Nova needed something to help manage some guilds and give something that felt personal, of which most bots couldn't really do.
                    I was created to help manage guilds and provide some personality which most other bots lack or just did not fit in very well with most guilds.
                    Now I run on a much more stable system and have a fair few features of my own. I can play music, help administrate your server and more!
                    `
                },
                {
                    name: "My Functions",
                    value: `Administration, Moderation, Support, Fun and Music`
                },
                {
                    name: "My Owner",
                    value: `NovaLynxie#9752`
                }
            )
            .setFooter("Built on Node.js using Discord.js with Commando.")
            .setThumbnail(this.client.user.displayAvatarURL({ format: 'png'}))
        return message.embed(embed);
    }
};
