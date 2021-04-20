const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const { stripIndents } = require('common-tags');

module.exports = class WoofCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'woof',
            aliases: ['wuf', 'dog'],
            group: 'image',
            memberName: 'woof',
            description: 'Sends a random dog image'
        });
    }

    async run(message) {
      fetch('https://random.dog/woof.json')
        .then(res => res.json())
        .then(json => {
          let url = json.url
          generateEmbed(url)
        })
      function generateEmbed(url) {
        const embed = new MessageEmbed()
          .setColor(0x00AE86)
          .setTitle('Woof! 🐶')
          .setDescription(stripIndents`
            Das a cute doggo! ^w^
            \`No image? There is a chance the image may not load.\`
          `)
          .setImage(url)
          .setTimestamp();
        return message.embed(embed);
      }
    }
    // Command is broken despite embed working, image does not show.
    // Reason: Getting undefined from 'file' variable. 
    // Possibly not handling API response correctly in code.
};
