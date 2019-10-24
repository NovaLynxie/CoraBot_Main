module.exports = {
    name: 'example_command',
    description: "Pings Cora and she returns your ping time",
    cooldown: 5,
    usage: 'ping',
    guildOnly: true,
    execute(message) {
        message.channel.send("Pong! `"+bot.ping+"ms`")
    }
};