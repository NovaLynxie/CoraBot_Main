const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class EmbedCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'embed',
            group: 'misc',
            memberName: 'embed',
            description: 'Embeds the text provided by user.',
            examples: ['embed Embeds are cool!'],
            args: [
                {
                    key: 'text',
                    prompt: 'What text would you like me to embed?',
                    type: 'string'
                }
            ]
        });
    }

    run(message, args) {
        const { text } = args;
        const embed = new MessageEmbed()
            .setDescription(text)
            .setAuthor(message.author.username, message.author.displayAvatarURL)
            .setColor(0x00AE86)
            .setTimestamp();
        return message.embed(embed);
    }
};
