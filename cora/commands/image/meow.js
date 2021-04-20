const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class MeowCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'meow',
            aliases: ['mew', 'cat'],
            group: 'image',
            memberName: 'meow',
            description: 'Sends a random cat image'
        });
    }

    async run(message) {
        const { file } = await fetch('https://aws.random.cat/meow')
            .then(response => response.json());
        //console.log(file)
        //return message.channel.send(file);
        const embed = new MessageEmbed()
            .setColor(0x00AE86)
            .setDescription('Meow! 🐱')
            .setImage(file)
            .setTimestamp();
        return message.embed(embed);
    }
};
