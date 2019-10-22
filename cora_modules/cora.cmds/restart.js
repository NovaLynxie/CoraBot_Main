module.exports = {
	name: 'restart',
    description: 'Restarts the bot and reconnects it back to discord.',
    execute(message, bot, version, token){
        console.log("CoraBot restarting...")
        message.channel.send("Restarting, I will be right back. :wink:")
        .then(bot.user.setStatus("dnd"))
        .then(bot.user.setActivity("rebooting..."))
        .then(_msg=>bot.destroy())
        .then(()=>bot.login(token));
    }
};