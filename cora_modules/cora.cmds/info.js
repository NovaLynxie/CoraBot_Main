const Discord = require('discord.js');
module.exports = {
    name: 'info',
    description: "Displays some info about the bot itself or owner.",
    aliases: ['i'],
    usage: 'info <arg> [bot owner]',
    guildOnly: true,
    execute(message, bot){
        const args = message.content.split(' ');
        if (!args[1]) {
            var embed = new Discord.RichEmbed()
                .setTitle("Core Info Help")
                .setColor(0x00FFFF)
                .setThumbnail(bot.user.avatarURL)
                .addField("You seem lost... what information did you want to see?", "`bot` tells you a bit about myself, Cora the AI. \n`owner` tells you some information about my owner, Novie x3 \n Command usage is `>info <args> [bot, owner]`.")
                .setFooter("Created by NovaLynxie#9765, coded in Discord.JS v11.5.1")
            message.channel.send(embed);
            return; //channel.send("Missing Args! `usage: >info <args> [bot, owner]`");
        }
        if (args[1]==='bot'){
            var embed = new Discord.RichEmbed()
                .setTitle("Bot Information <a:pawingcat:635163464905523221>")
                .setColor(0x00FFFF)
                .setThumbnail(bot.user.avatarURL)
                .addField("Name & TagID:",bot.user.username+' ('+bot.user.tag+')')
                .addField("Created:",bot.user.createdAt)
                .addField("About Me", "I am Nova's Personal bot. I am mostly used for testing features and stuff. Sometimes I play music but not that well... I do try though ^w^") 
                .setFooter("Created by NovaLynxie#9765, coded in Discord.JS v11.5.1, coded in Discord.JS v11.5.1")
            message.channel.send(embed);
            return;
        } else if (args[1]==='owner'){
            var ownerID = '234356998836191232'
            let ownerData = message.guild.member(message.guild.members.get(ownerID))
            //console.log(ownerData)
            var embed = new Discord.RichEmbed()
                .setTitle("My Owner's Info")
                .setColor(0x00FFFF)
                .setThumbnail(ownerData.user.avatarURL) //"https://cdn.discordapp.com/avatars/234356998836191232/3bcf8aa8fabdab92bf753d61db00e548.png?size=2048"
                .addField("Date Joined", ownerData.user.createdAt)
                .addField("About Me", "My name is Nova Lynxie, I am sometimes shy meeting other people but can be quite friendly once you get to know me. Programming is one hobby I do enjoy, especially if it involves fixing problems and finding solutions. I am glad to have brought Cora back after many years of being stowed away and left with obsolete code, now renewed and brought back to life! \nLets hope it will stay that way this time X3")
                .addField("Social Links", "Twitch: https://www.twitch.tv/novalynxie \nMixer: https://mixer.com/NovaLynxie")
                .setFooter("Created by NovaLynxie#9765, coded in Discord.JS v11.5.1, coded in Discord.JS v11.5.1")
            message.channel.send(embed);
            return;
        } else {
            var embed = new Discord.RichEmbed()
                .setTitle("Invalid Command!")
                .setColor(0x00FFFF)
                .setThumbnail(bot.user.avatarURL)
                .addField("Did you enter the command correctly?", "Check you entered the command correctly, \nCommand usage is `>info <args> [bot, owner]`.")
                .setFooter("Created by NovaLynxie#9765, coded in Discord.JS v11.5.1")
            message.channel.send(embed);
            return; //channel.send("Invalid Args! `usage: >info <args> [bot, owner]`");
        }
    }
};