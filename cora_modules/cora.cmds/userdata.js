module.exports = {
    name: 'userdata',
    description: "Debug command to dump data via bot from discord.",
    execute(message){
        if (!args.length) {
            return channel.send("Unknown User! \n```usage: >userinfo <args> [@mention, userID]```");
        }
        let userData = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]))
        console.log(userData) //debug code to dump info into bot console
        let fileWrite = Flatted.stringify(userData, null, 2)
        var filePath = './cora_modules/cora.debug/datadump_userdata.json'
        fs.writeFileSync(filePath, fileWrite)
        console.log("debug.datadump_userdata -> " + filePath)
        channel.send("Data dump completed successfully! \nCheck my console " + message.author.toString())
    }
};