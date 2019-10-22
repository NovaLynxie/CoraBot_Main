module.exports = {
    name: 'poke',
    description: "Pokes Cora. Hey that tickles!",
    aliases: ['tap', 'nudge'],
    execute(message) {
        message.channel.send("<a:pawingcat:635163464905523221> "+message.author.toString())
    }
};