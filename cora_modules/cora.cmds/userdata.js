const Flatted = require("flatted");
const fs = require('fs');
module.exports = {
    name: 'userdata',
    description: "Gets raw data amd dumps data from discord through the bot.",
    aliases: ['datadump'],
    usage: 'userdata <args> [@mention, userID]',
    cooldown: 5,
    guildOnly: true,
    execute(message){
        const args = message.content.split(' ');
        if (!args.length) {
            return channel.send("Unknown User! \n```usage: >userinfo <args> [@mention, userID]```");
        }
        try {
            let userData = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]))
            console.log(userData) //debug code to dump info into bot console
            let fileWrite = Flatted.stringify(userData, null, 2)
            var filePath = './cora_modules/cora.debug/datadump_userdata.json'
            fs.writeFileSync(filePath, fileWrite)
            console.log("debug.datadump_userdata -> " + filePath)
            message.channel.send("Data dump completed successfully! \nCheck my console " + message.author.toString())
        } catch (error) {
            console.error(error)
            message.reply("Parse Error! Check console.")
        }
        
    }
};