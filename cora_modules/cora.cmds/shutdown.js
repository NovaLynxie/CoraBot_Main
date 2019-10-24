module.exports = {
	name: 'shutdown',
    description: 'Disconnects the bot from discord and shuts down cleanly',
    aliases: ['poweroff','terminate'],
    guildOnly: true,
    execute(message, bot){
        console.log("[CoraBot] SHUTDOWN command received!")
        message.channel.send("Shutting down. Good night... <:sleepycat:635163563878514688>")
        .then(bot.user.setStatus("dnd"))
        .then(bot.user.setActivity("shutting down..."))
        .then(_msg=>bot.destroy());
    }
};