const { stripIndents } = require("common-tags");

module.exports = {
    data: {
        name: 'info',
        aliases: ['about'],
        category: 'info',
        description: 'Displays basic information about the bot or server.'
    },
    async execute(interaction, client) {


        const embed = {
            title: 'About Me',
            color: 0xE7A3F0,
            description: stripIndents`
                Hello ${message.author.username}! My name is ${client.user.username}, I am a multi-purpose Discord Bot built on Discord.JS v13.`,
            fields: [
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
                    value: `NovaLynxie#9765`
                }
            ],
            footer: "Built on Node.JS v16 using Discord.JS v13.",
            thumbnail: client.user.displayAvatarURL({ format: 'png' })
        }
        
        await interaction.reply({ embeds: [embed]});
    }
}