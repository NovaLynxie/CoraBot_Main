module.exports = {
    name: 'example_command',
    description: "Pings Cora and she returns your ping time",
    execute(message) {
        message.channel.send("Pong! `"+bot.ping+"ms`")
    }
};