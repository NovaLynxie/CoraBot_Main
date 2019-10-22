const Discord = require('discord.js');
const bot = new Discord.Client();
module.exports = {
	name: 'help',
    description: 'Shows the bot help in the embedded format (BETA)',
    execute(message, bot, token){
      const args = message.content.split(' ');
      if (!args[1]) {
        var embed = new Discord.RichEmbed()
          .setTitle("Bot Commands :scroll:")
          .setColor(0x00FFFF)
          .setThumbnail(bot.user.avatarURL)
          .addField("Bot Prefix", "Prefix is `>`")
          .addField("Personal :smile_cat:","`info` - Shows some information about me in case you wanted to know more. \n `poke` - Pokes me to grab my attention. Wait... why do I even have this? :eyes: \n `owner` - Want to find out more about my owner?")
          .addField("Music :musical_score:","`play` - Plays some music in a voice channel for me to sing to you :wink: \n `skip` - Skips the song in the queue if it isn't your genre or type `stop` - Stops the music at any time during the song")
          .addField("Admin :cop:","Need these commands? Use `>cmd -mod` to see commands.")
          .setFooter("Created by NovaLynxie#9765, coded in Discord.JS v11.5.1")
        message.channel.send(embed);
        return;
      } else if (args[1] === '-mod') {
        if (message.member.roles.some(role => role.name === 'Staff')) {
          var embed = new Discord.RichEmbed()
            .setTitle("Admin Only Commands :cop:")
            .setColor(0xfcdc2)
            .setThumbnail(bot.user.avatarURL)
            .addField("Bot Prefix", "Prefix is `>`")
            .addField("Moderator+","Currently W.I.P. and not fully implemented right now, sorry.")
            .addField("Owner","`restart` - Refreshes my state and allows me to restart my systems. \n`shutdown` - Deactivates me and shuts down my systems. Required when updating code and core settings")
            .setFooter("Created by NovaLynxie#9765, coded in Discord.JS v11.5.1")
          message.channel.send(embed);
        } else {
          message.channel.send(":no_entry: Access Denied! :no_entry: \n Moderator permissions required!")
        }
        return;
      } else if (args[1] === '-dev') {
        if (message.member.roles.some(role => role.name === 'BotCMD')) {
          var embed = new Discord.RichEmbed()
            .setTitle("Developer Commands :tools:")
            .setColor(0xfa7829)
            .setThumbnail(bot.user.avatarURL)
            .addField(":warning:WARNING!:warning: ", "For developer use only! \n Some functions may break or cause me to crash! Please use with caution.")
            .addField("AvatarURL","avatar `usage >avatar <userid>`")
            .setFooter("Created by NovaLynxie#9765, coded in Discord.JS v11.5.1")
          message.channel.send(embed);
        } else {
          message.channel.send(":no_entry: Access Denied! :no_entry: \n Developer permissions required!")
        }
        return;
      } else {
        message.channel.send("Invalid arguments! Usage `>help <arg> [-mod -dev]`")
      }
    },
};